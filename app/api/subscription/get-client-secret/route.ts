import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-07-30.basil",
});

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const subscriptionId = searchParams.get('subscriptionId');

        if (!subscriptionId) {
            return NextResponse.json({ message: "Missing subscriptionId" }, { status: 400 });
        }

        // Get the subscription from database
        const dbSubscription = await prisma.artistSubscription.findFirst({
            where: {
                stripeSubscriptionId: subscriptionId,
                artist: {
                    userId: session.user.id
                }
            }
        });

        if (!dbSubscription) {
            return NextResponse.json({ message: "Subscription not found" }, { status: 404 });
        }

        // Get the Stripe subscription
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['latest_invoice.payment_intent']
        });

        // Get client secret from the payment intent
        let clientSecret: string | null = null;

        if (stripeSubscription.latest_invoice) {
            const invoice = stripeSubscription.latest_invoice as Stripe.Invoice & {
                payment_intent?: Stripe.PaymentIntent | string;
            };

            if (typeof invoice.payment_intent === 'string') {
                const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
                clientSecret = paymentIntent.client_secret;
            } else if (invoice.payment_intent) {
                clientSecret = invoice.payment_intent.client_secret;
            }
        }

        // If no client secret from subscription, check if we have a stored payment intent
        if (!clientSecret && dbSubscription.paymentIntentId) {
            console.log("Trying stored payment intent:", dbSubscription.paymentIntentId);
            try {
                const paymentIntent = await stripe.paymentIntents.retrieve(dbSubscription.paymentIntentId);
                if (paymentIntent.status === 'requires_payment_method' || paymentIntent.status === 'requires_confirmation') {
                    clientSecret = paymentIntent.client_secret;
                }
            } catch (error) {
                console.log("Stored payment intent not found or invalid");
            }
        }

        if (!clientSecret) {
            console.log("No payment intent found, subscription details:", {
                subscriptionId: stripeSubscription.id,
                status: stripeSubscription.status,
                latestInvoice: stripeSubscription.latest_invoice,
                hasPaymentIntent: !!stripeSubscription.latest_invoice,
                storedPaymentIntentId: dbSubscription.paymentIntentId
            });

            return NextResponse.json(
                {
                    message: "No payment intent found for this subscription",
                    subscriptionStatus: stripeSubscription.status
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            clientSecret,
            subscriptionId: stripeSubscription.id
        });

    } catch (error) {
        console.error("Error getting client secret:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}