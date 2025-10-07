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

        const { planId, billingCycle, paymentIntentId, setupIntentId } = await req.json();

        if (!planId || !billingCycle || (!paymentIntentId && !setupIntentId)) {
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
                metadata: paymentIntent.metadata
            };
        }

        // Verify plan exists
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return NextResponse.json({ message: "Plan not found" }, { status: 404 });
        }

        // Store payment information for later use in form
        if (!paymentData) {
            return NextResponse.json({ message: "Payment data not found" }, { status: 400 });
        }

        await prisma.paymentIntent.create({
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
                    isFreePlan: isFreePlan,
                    intentType: setupIntentId ? 'setup' : 'payment'
                }
            }
        });

        return NextResponse.json({
            message: isFreePlan ? "Free plan activated successfully" : "Payment processed successfully",
            paymentIntentId: paymentData.id,
            isFreePlan: isFreePlan
        });

    } catch (error) {
        console.error("Payment processing error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
