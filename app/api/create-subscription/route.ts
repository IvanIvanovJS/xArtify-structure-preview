import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { SubscriptionPlan } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-07-30.basil",
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { planId, billingCycle, isUpgrade, currentSubscriptionId } = await req.json();

        if (!planId || !billingCycle) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Get plan details
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return NextResponse.json({ message: "Plan not found" }, { status: 404 });
        }

        const isFreePlan = plan.monthlyPrice === 0;

        if (isFreePlan) {
            // For free plans, just update the subscription directly
            const result = await prisma.$transaction(async (tx) => {
                const updatedSubscription = await tx.artistSubscription.update({
                    where: { id: currentSubscriptionId },
                    data: {
                        planId: plan.id,
                        billingCycle: billingCycle,
                        status: 'active',
                        stripeSubscriptionId: null,
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
                        cancelAtPeriodEnd: false,
                        cancelledAt: null,
                    },
                    include: {
                        plan: true
                    }
                });

                return updatedSubscription;
            });

            return NextResponse.json({
                message: "Free plan activated successfully",
                subscription: result,
                isFreePlan: true
            });
        }

        // Get user's artist profile
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                subscription: true
            }
        });

        if (!artistProfile) {
            return NextResponse.json({ message: "Artist profile not found" }, { status: 404 });
        }

        // Create or get Stripe customer
        let customerId = artistProfile.subscription?.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: session.user.email!,
                name: session.user.name || undefined,
                metadata: {
                    userId: session.user.id,
                    artistId: artistProfile.id
                }
            });
            customerId = customer.id;
        }

        // Create Stripe price for the plan
        const priceId = await getOrCreateStripePrice(plan, billingCycle);

        // Calculate amount for manual payment intent if needed
        const amount = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

        // Create Stripe subscription with proper payment setup
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: {
                save_default_payment_method: 'on_subscription',
                payment_method_types: ['card']
            },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                userId: session.user.id,
                artistId: artistProfile.id,
                planId: plan.id,
                billingCycle: billingCycle,
                isUpgrade: isUpgrade ? 'true' : 'false'
            }
        });

        // Store subscription info temporarily (will be updated after payment)
        // We only update stripeSubscriptionId and stripeCustomerId for tracking
        await prisma.artistSubscription.update({
            where: { id: currentSubscriptionId },
            data: {
                stripeCustomerId: customerId,
                // Store the pending subscription ID but don't change the plan yet
                stripeSubscriptionId: subscription.id,
            }
        });

        // Get the invoice and payment intent
        let clientSecret: string | null = null;

        if (subscription.latest_invoice) {
            const invoice = subscription.latest_invoice as Stripe.Invoice & {
                payment_intent?: Stripe.PaymentIntent | string;
            };

            // If payment_intent is a string (ID), fetch it
            if (typeof invoice.payment_intent === 'string') {
                const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
                clientSecret = paymentIntent.client_secret;
            } else if (invoice.payment_intent) {
                // If it's already expanded
                clientSecret = invoice.payment_intent.client_secret;
            }
        }

        // If still no client secret, create a payment intent manually
        if (!clientSecret) {
            console.log("Creating manual payment intent for subscription:", subscription.id);
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: 'bgn',
                customer: customerId,
                setup_future_usage: 'off_session', // For future subscription payments
                metadata: {
                    subscriptionId: subscription.id,
                    userId: session.user.id,
                    planId: plan.id,
                    billingCycle: billingCycle,
                    type: 'subscription_upgrade'
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            clientSecret = paymentIntent.client_secret;

            // Store payment intent ID in database for reference
            await prisma.artistSubscription.update({
                where: { id: currentSubscriptionId },
                data: {
                    paymentIntentId: paymentIntent.id
                }
            });
        }

        if (!clientSecret) {
            console.error("Failed to get client secret", {
                subscriptionId: subscription.id,
                latestInvoice: subscription.latest_invoice
            });
            return NextResponse.json(
                { message: "Failed to create payment intent" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Subscription created successfully",
            clientSecret: clientSecret,
            subscriptionId: subscription.id,
            planId: plan.id,
            billingCycle: billingCycle,
            isFreePlan: false
        });

    } catch (error) {
        console.error("Error creating subscription:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

async function getOrCreateStripePrice(plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly') {
    try {
        const priceKey = billingCycle === 'yearly' ? 'stripeYearlyPriceId' : 'stripePriceId';
        const existingPriceId = plan[priceKey];

        if (existingPriceId) {
            // Verify the price still exists in Stripe
            try {
                await stripe.prices.retrieve(existingPriceId);
                return existingPriceId;
            } catch (error) {
                console.log("Existing price not found in Stripe, creating new one");
            }
        }

        // Create new Stripe product if it doesn't exist
        let productId = plan.id;
        try {
            await stripe.products.retrieve(productId);
        } catch (error) {
            const product = await stripe.products.create({
                id: productId,
                name: plan.displayName,
                description: plan.description,
                metadata: {
                    planId: plan.id,
                    planName: plan.name
                }
            });
            productId = product.id;
        }

        // Create new price
        const amount = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
        const interval = billingCycle === 'yearly' ? 'year' : 'month';

        const price = await stripe.prices.create({
            product: productId,
            unit_amount: Math.round(amount * 100), // Convert to cents
            currency: 'bgn',
            recurring: {
                interval: interval,
            },
            metadata: {
                planId: plan.id,
                billingCycle: billingCycle
            }
        });

        // Update plan with new price ID
        await prisma.subscriptionPlan.update({
            where: { id: plan.id },
            data: {
                [priceKey]: price.id
            }
        });

        return price.id;
    } catch (error) {
        console.error("Error creating Stripe price:", error);
        throw error;
    }
}

