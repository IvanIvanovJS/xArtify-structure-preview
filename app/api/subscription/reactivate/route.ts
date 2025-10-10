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

        const { subscriptionId } = await req.json();

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
            return NextResponse.json({ message: "No subscription found" }, { status: 404 });
        }

        if (artistProfile.subscription.id !== subscriptionId) {
            return NextResponse.json({ message: "Subscription not found" }, { status: 404 });
        }

        // Reactivate Stripe subscription
        if (artistProfile.subscription.stripeSubscriptionId) {
            await stripe.subscriptions.update(artistProfile.subscription.stripeSubscriptionId, {
                cancel_at_period_end: false,
                metadata: {
                    reactivated_by: 'user',
                    reactivated_at: new Date().toISOString()
                }
            });
        }

        // Update database
        const result = await prisma.artistSubscription.update({
            where: { id: subscriptionId },
            data: {
                cancelAtPeriodEnd: false,
                cancelledAt: null,
                status: 'active'
            },
            include: {
                plan: true
            }
        });

        return NextResponse.json({
            message: "Абонаментът беше реактивиран успешно!",
            subscription: result
        });

    } catch (error) {
        console.error("Error reactivating subscription:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

