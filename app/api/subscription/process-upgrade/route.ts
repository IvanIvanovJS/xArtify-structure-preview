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

        const { planId, billingCycle, paymentIntentId, setupIntentId, currentSubscriptionId } = await req.json();

        if (!planId || !billingCycle || !currentSubscriptionId || (!paymentIntentId && !setupIntentId)) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        let isFreePlan = false;
        let paymentData: {
            id: string;
            amount: number;
            currency: string;
            status: string;
            metadata: Record<string, string>;
        } | null = null;

        if (setupIntentId) {
            // Handle SetupIntent for free plans
            const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
            isFreePlan = setupIntent.metadata?.isFreePlan === 'true';

            if (setupIntent.status !== "succeeded") {
                return NextResponse.json({ message: "Payment method not saved" }, { status: 400 });
            }

            paymentData = {
                id: setupIntentId,
                amount: 0,
                currency: "bgn",
                status: "succeeded",
                metadata: setupIntent.metadata || {}
            };
        } else if (paymentIntentId) {
            // Handle PaymentIntent for paid plans
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            isFreePlan = paymentIntent.metadata?.isFreePlan === 'true';

            if (paymentIntent.status !== "succeeded") {
                return NextResponse.json({ message: "Payment not completed" }, { status: 400 });
            }

            paymentData = {
                id: paymentIntentId,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: "succeeded",
                metadata: paymentIntent.metadata || {}
            };
        }

        // Verify plan exists
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return NextResponse.json({ message: "Plan not found" }, { status: 404 });
        }

        if (!paymentData) {
            return NextResponse.json({ message: "Payment data not found" }, { status: 400 });
        }

        // Update subscription with transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update the subscription
            const updatedSubscription = await tx.artistSubscription.update({
                where: { id: currentSubscriptionId },
                data: {
                    planId: plan.id,
                    billingCycle: billingCycle,
                    status: 'active',
                    paymentIntentId: isFreePlan ? null : paymentData.id,
                    updatedAt: new Date()
                },
                include: {
                    plan: true
                }
            });

            // Store payment information
            await tx.paymentIntent.create({
                data: {
                    id: paymentData.id,
                    userId: session.user.id,
                    planId: planId,
                    billingCycle: billingCycle,
                    amount: paymentData.amount,
                    currency: paymentData.currency,
                    status: "succeeded",
                    metadata: {
                        planName: plan.name,
                        planDisplayName: plan.displayName,
                        isUpgrade: true,
                        isFreePlan: isFreePlan,
                        intentType: setupIntentId ? 'setup' : 'payment'
                    }
                }
            });

            return updatedSubscription;
        });

        return NextResponse.json({
            message: "Plan upgraded successfully",
            subscription: result
        });

    } catch (error) {
        console.error("Plan upgrade error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
