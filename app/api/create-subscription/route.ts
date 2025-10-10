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

        // Create Stripe subscription
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                userId: session.user.id,
                artistId: artistProfile.id,
                planId: plan.id,
                billingCycle: billingCycle,
                isUpgrade: isUpgrade ? 'true' : 'false'
            }
        });

        // Update database with subscription info
        const result = await prisma.$transaction(async (tx) => {
            const updatedSubscription = await tx.artistSubscription.update({
                where: { id: currentSubscriptionId },
                data: {
                    planId: plan.id,
                    billingCycle: billingCycle,
                    status: 'pending',
                    stripeCustomerId: customerId,
                    stripeSubscriptionId: subscription.id,
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

        const invoice = subscription.latest_invoice as Stripe.Invoice;
        const paymentIntent = (invoice as Stripe.Invoice & { payment_intent: Stripe.PaymentIntent }).payment_intent;

        return NextResponse.json({
            message: "Subscription created successfully",
            subscription: result,
            clientSecret: paymentIntent.client_secret,
            subscriptionId: subscription.id,
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

