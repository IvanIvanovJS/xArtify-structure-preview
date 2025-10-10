import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-07-30.basil",
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { planId, billingCycle, paymentIntentId, currentSubscriptionId } = await req.json();

        if (!planId || !billingCycle || !paymentIntentId || !currentSubscriptionId) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Get payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
            return NextResponse.json({ message: "Payment not succeeded" }, { status: 400 });
        }

        // Get the subscription from the payment intent metadata
        const subscriptionId = paymentIntent.metadata.subscription_id;

        if (!subscriptionId) {
            return NextResponse.json({ message: "No subscription found" }, { status: 400 });
        }

        // Get the Stripe subscription
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Update the artist subscription
        const result = await prisma.$transaction(async (tx) => {
            const updatedSubscription = await tx.artistSubscription.update({
                where: { id: currentSubscriptionId },
                data: {
                    planId: planId,
                    billingCycle: billingCycle,
                    status: 'active',
                    stripeSubscriptionId: subscriptionId,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
                    cancelAtPeriodEnd: false,
                    cancelledAt: null,
                },
                include: {
                    plan: true
                }
            });

            // Store payment record
            await tx.paymentIntent.create({
                data: {
                    id: paymentIntentId,
                    userId: session.user.id,
                    planId: planId,
                    billingCycle: billingCycle,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    status: "succeeded",
                    metadata: {
                        subscriptionId: subscriptionId,
                        isRecurring: true,
                        planName: updatedSubscription.plan.name,
                        planDisplayName: updatedSubscription.plan.displayName,
                    }
                }
            });

            return updatedSubscription;
        });

        return NextResponse.json({
            message: "Subscription confirmed successfully",
            subscription: result
        });

    } catch (error) {
        console.error("Error confirming subscription:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

