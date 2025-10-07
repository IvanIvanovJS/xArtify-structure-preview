import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { planId, billingCycle, paymentIntentId } = await req.json();

        if (!planId || !billingCycle || !paymentIntentId) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Verify payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
            return NextResponse.json({ message: "Payment not completed" }, { status: 400 });
        }

        // Verify plan exists
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return NextResponse.json({ message: "Plan not found" }, { status: 404 });
        }

        // Store payment information for later use in form
        await prisma.paymentIntent.create({
            data: {
                id: paymentIntentId,
                userId: session.user.id,
                planId: planId,
                billingCycle: billingCycle,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: "succeeded",
                metadata: {
                    planName: plan.name,
                    planDisplayName: plan.displayName
                }
            }
        });

        return NextResponse.json({
            message: "Payment processed successfully",
            paymentIntentId: paymentIntentId
        });

    } catch (error) {
        console.error("Payment processing error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
