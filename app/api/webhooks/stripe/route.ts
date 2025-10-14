import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-07-30.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get("stripe-signature")!;

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error("Webhook signature verification failed:", err);
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        console.log("Received Stripe webhook:", event.type);

        switch (event.type) {
            case "customer.subscription.created":
                await handleSubscriptionCreated(event.data.object as Stripe.Subscription & { current_period_start: number; current_period_end: number; cancel_at_period_end: boolean });
                break;

            case "customer.subscription.updated":
                await handleSubscriptionUpdated(event.data.object as Stripe.Subscription & { current_period_start: number; current_period_end: number; cancel_at_period_end: boolean; canceled_at?: number });
                break;

            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;

            case "invoice.payment_succeeded":
                await handlePaymentSucceeded(event.data.object as Stripe.Invoice & { subscription?: string; payment_intent?: string });
                break;

            case "invoice.payment_failed":
                await handlePaymentFailed(event.data.object as Stripe.Invoice & { subscription?: string; payment_intent?: string });
                break;

            case "invoice.upcoming":
                await handleUpcomingInvoice(event.data.object as Stripe.Invoice & { subscription?: string });
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 }
        );
    }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription & { current_period_start: number; current_period_end: number; cancel_at_period_end: boolean }) {
    try {
        console.log("Handling subscription created:", subscription.id);

        // Find the artist subscription by Stripe subscription ID
        const artistSubscription = await prisma.artistSubscription.findFirst({
            where: { stripeSubscriptionId: subscription.id },
            include: { artist: { include: { user: true } } }
        });

        if (!artistSubscription) {
            console.log("No artist subscription found for Stripe subscription:", subscription.id);
            return;
        }

        // Update subscription status
        await prisma.artistSubscription.update({
            where: { id: artistSubscription.id },
            data: {
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
            }
        });

        console.log("Subscription created successfully for artist:", artistSubscription.artistId);
    } catch (error) {
        console.error("Error handling subscription created:", error);
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription & { current_period_start: number; current_period_end: number; cancel_at_period_end: boolean; canceled_at?: number }) {
    try {
        console.log("Handling subscription updated:", subscription.id);

        const artistSubscription = await prisma.artistSubscription.findFirst({
            where: { stripeSubscriptionId: subscription.id }
        });

        if (!artistSubscription) {
            console.log("No artist subscription found for Stripe subscription:", subscription.id);
            return;
        }

        // Update subscription with new data
        await prisma.artistSubscription.update({
            where: { id: artistSubscription.id },
            data: {
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                cancelledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
            }
        });

        console.log("Subscription updated successfully for artist:", artistSubscription.artistId);
    } catch (error) {
        console.error("Error handling subscription updated:", error);
    }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
        console.log("Handling subscription deleted:", subscription.id);

        const artistSubscription = await prisma.artistSubscription.findFirst({
            where: { stripeSubscriptionId: subscription.id }
        });

        if (!artistSubscription) {
            console.log("No artist subscription found for Stripe subscription:", subscription.id);
            return;
        }

        // Update subscription status to cancelled
        await prisma.artistSubscription.update({
            where: { id: artistSubscription.id },
            data: {
                status: 'cancelled',
                cancelledAt: new Date(),
                cancelAtPeriodEnd: false,
            }
        });

        console.log("Subscription cancelled for artist:", artistSubscription.artistId);
    } catch (error) {
        console.error("Error handling subscription deleted:", error);
    }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice & { subscription?: string; payment_intent?: string }) {
    try {
        console.log("Handling payment succeeded:", invoice.id);

        if (!invoice.subscription) {
            console.log("No subscription found for invoice:", invoice.id);
            return;
        }

        const artistSubscription = await prisma.artistSubscription.findFirst({
            where: { stripeSubscriptionId: invoice.subscription as string },
            include: { artist: { include: { user: true } } }
        });

        if (!artistSubscription) {
            console.log("No artist subscription found for invoice subscription:", invoice.subscription);
            return;
        }

        // Update subscription status to active
        await prisma.artistSubscription.update({
            where: { id: artistSubscription.id },
            data: {
                status: 'active',
                currentPeriodStart: new Date(invoice.period_start * 1000),
                currentPeriodEnd: new Date(invoice.period_end * 1000),
            }
        });

        // Store payment record
        await prisma.paymentIntent.create({
            data: {
                id: invoice.payment_intent as string,
                userId: artistSubscription.artist.userId,
                planId: artistSubscription.planId,
                billingCycle: artistSubscription.billingCycle,
                amount: invoice.amount_paid,
                currency: invoice.currency,
                status: "succeeded",
                metadata: {
                    invoiceId: invoice.id,
                    subscriptionId: invoice.subscription as string,
                    isRecurring: true,
                }
            }
        });

        console.log("Payment succeeded for artist:", artistSubscription.artistId);
    } catch (error) {
        console.error("Error handling payment succeeded:", error);
    }
}

async function handlePaymentFailed(invoice: Stripe.Invoice & { subscription?: string; payment_intent?: string }) {
    try {
        console.log("Handling payment failed:", invoice.id);

        if (!invoice.subscription) {
            console.log("No subscription found for failed invoice:", invoice.id);
            return;
        }

        const artistSubscription = await prisma.artistSubscription.findFirst({
            where: { stripeSubscriptionId: invoice.subscription as string },
            include: { artist: true }
        });

        if (!artistSubscription) {
            console.log("No artist subscription found for failed invoice subscription:", invoice.subscription);
            return;
        }

        // Update subscription status to past_due
        await prisma.artistSubscription.update({
            where: { id: artistSubscription.id },
            data: {
                status: 'past_due',
            }
        });

        // Store failed payment record
        await prisma.paymentIntent.create({
            data: {
                id: invoice.payment_intent as string,
                userId: artistSubscription.artist.userId,
                planId: artistSubscription.planId,
                billingCycle: artistSubscription.billingCycle,
                amount: invoice.amount_due,
                currency: invoice.currency,
                status: "failed",
                metadata: {
                    invoiceId: invoice.id,
                    subscriptionId: invoice.subscription as string,
                    failureReason: invoice.last_finalization_error?.message || 'Payment failed',
                    isRecurring: true,
                }
            }
        });

        console.log("Payment failed for artist:", artistSubscription.artistId);
    } catch (error) {
        console.error("Error handling payment failed:", error);
    }
}

async function handleUpcomingInvoice(invoice: Stripe.Invoice & { subscription?: string }) {
    try {
        console.log("Handling upcoming invoice:", invoice.id);

        if (!invoice.subscription) {
            console.log("No subscription found for upcoming invoice:", invoice.id);
            return;
        }

        const artistSubscription = await prisma.artistSubscription.findFirst({
            where: { stripeSubscriptionId: invoice.subscription as string },
            include: { artist: { include: { user: true } } }
        });

        if (!artistSubscription) {
            console.log("No artist subscription found for upcoming invoice subscription:", invoice.subscription);
            return;
        }

        // Here you could send email notifications about upcoming payments
        // For now, just log the information
        console.log(`Upcoming payment for artist ${artistSubscription.artistId}: ${invoice.amount_due / 100} ${invoice.currency.toUpperCase()}`);

        // You could implement email notifications here:
        // await sendUpcomingPaymentEmail(artistSubscription.artist.user.email, invoice);

    } catch (error) {
        console.error("Error handling upcoming invoice:", error);
    }
}
