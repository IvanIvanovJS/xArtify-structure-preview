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

        const { subscriptionId, cancelAtPeriodEnd = true } = await req.json();

        if (!subscriptionId) {
            return NextResponse.json({ message: "Missing subscription ID" }, { status: 400 });
        }

        // Get user's artist profile and subscription
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                subscription: true
            }
        });

        if (!artistProfile || !artistProfile.subscription) {
            return NextResponse.json({ message: "No active subscription found" }, { status: 404 });
        }

        if (artistProfile.subscription.id !== subscriptionId) {
            return NextResponse.json({ message: "Subscription not found" }, { status: 404 });
        }

        // Cancel Stripe subscription
        if (artistProfile.subscription.stripeSubscriptionId) {
            await stripe.subscriptions.update(artistProfile.subscription.stripeSubscriptionId, {
                cancel_at_period_end: cancelAtPeriodEnd,
                metadata: {
                    cancelled_by: 'user',
                    cancelled_at: new Date().toISOString()
                }
            });
        }

        // Update database
        const result = await prisma.artistSubscription.update({
            where: { id: subscriptionId },
            data: {
                cancelAtPeriodEnd: cancelAtPeriodEnd,
                cancelledAt: cancelAtPeriodEnd ? null : new Date(),
                status: cancelAtPeriodEnd ? 'active' : 'cancelled'
            },
            include: {
                plan: true
            }
        });

        const message = cancelAtPeriodEnd
            ? "Абонаментът ще бъде спрян в края на текущия биллинг период."
            : "Абонаментът беше спрян веднага.";

        return NextResponse.json({
            message: message,
            subscription: result
        });

    } catch (error) {
        console.error("Error cancelling subscription:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

