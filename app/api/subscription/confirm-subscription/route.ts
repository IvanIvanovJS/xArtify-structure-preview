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

        const { subscriptionId, planId, billingCycle, paymentIntentId } = await req.json();

        if (!subscriptionId || !planId || !billingCycle) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // If we have payment intent ID, verify the payment succeeded
        if (paymentIntentId) {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status !== "succeeded") {
                return NextResponse.json({
                    message: "Payment not completed",
                    status: paymentIntent.status
                }, { status: 400 });
            }
        }

        // Get the Stripe subscription
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;

        // For upgrade subscriptions, we don't need to check Stripe status
        // The payment confirmation is what matters
        console.log('Confirming subscription:', {
            subscriptionId,
            stripeStatus: stripeSubscription.status,
            planId,
            billingCycle
        });

        // Get the artist subscription from database
        const artistSubscription = await prisma.artistSubscription.findFirst({
            where: {
                stripeSubscriptionId: subscriptionId,
                artist: {
                    userId: session.user.id
                }
            }
        });

        if (!artistSubscription) {
            return NextResponse.json({ message: "Subscription not found" }, { status: 404 });
        }

        // Update the artist subscription with the new plan
        const result = await prisma.artistSubscription.update({
            where: { id: artistSubscription.id },
            data: {
                planId: planId,
                billingCycle: billingCycle,
                status: 'active',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
                cancelAtPeriodEnd: false,
                cancelledAt: null,
            },
            include: {
                plan: true
            }
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

