// app/api/create-payment-intent/route.ts
import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-07-30.basil",
});

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { planId, billingCycle, isArtist, isUpgrade, currentSubscriptionId } = await req.json();

        if (!isArtist || !planId || !billingCycle) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Get plan details
        const { prisma } = await import("@/lib/prisma");
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return NextResponse.json({ message: "Plan not found" }, { status: 404 });
        }

        // Calculate amount based on plan and billing cycle
        const amount = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
        const isFreePlan = amount === 0;

        if (isFreePlan) {
            // For free plans, use SetupIntent to save payment method without charging
            const setupIntent = await stripe.setupIntents.create({
                payment_method_types: ['card'],
                metadata: {
                    userId: session.user.id,
                    email: session.user.email as string,
                    planId: planId,
                    billingCycle: billingCycle,
                    isUpgrade: isUpgrade ? 'true' : 'false',
                    currentSubscriptionId: currentSubscriptionId || '',
                    isFreePlan: 'true',
                },
            });

            return NextResponse.json({
                clientSecret: setupIntent.client_secret,
                setupIntentId: setupIntent.id,
                isFreePlan: true
            });
        } else {
            // For paid plans, use PaymentIntent
            const amountInCents = Math.round(amount * 100);

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: "bgn",
                metadata: {
                    userId: session.user.id,
                    email: session.user.email as string,
                    planId: planId,
                    billingCycle: billingCycle,
                    isUpgrade: isUpgrade ? 'true' : 'false',
                    currentSubscriptionId: currentSubscriptionId || '',
                    isFreePlan: 'false',
                },
                automatic_payment_methods: {
                    enabled: true, // активира всички автоматично поддържани методи
                },
            });

            return NextResponse.json({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                isFreePlan: false
            });
        }
    } catch (error) {
        console.error("Error creating payment intent:", error);
        return NextResponse.json({ message: "Error creating payment intent" }, { status: 500 });
    }
}
