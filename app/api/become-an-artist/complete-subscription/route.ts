import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { z } from 'zod';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const CompleteSubscriptionSchema = z.object({
    artistId: z.string().min(1, 'Artist ID е задължителен'),
    planId: z.string().min(1, 'Plan ID е задължителен'),
    billingCycle: z.enum(['monthly', 'yearly']),
    paymentIntentId: z.string().min(1, 'Payment Intent ID е задължителен')
});

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedData = CompleteSubscriptionSchema.parse(body);

        // Verify the artist profile belongs to the user
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { id: validatedData.artistId },
            include: { user: true }
        });

        if (!artistProfile || artistProfile.userId !== session.user.id) {
            return NextResponse.json({ message: 'Artist profile not found or unauthorized' }, { status: 404 });
        }

        // Get the plan details
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: validatedData.planId }
        });

        if (!plan) {
            return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
        }

        // Verify payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(validatedData.paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return NextResponse.json({ message: 'Payment not completed' }, { status: 400 });
        }

        // Create or update subscription
        const result = await prisma.$transaction(async (tx) => {
            // Check if subscription already exists
            const existingSubscription = await tx.artistSubscription.findUnique({
                where: { artistId: validatedData.artistId }
            });

            let subscription;
            if (existingSubscription) {
                // Update existing subscription
                subscription = await tx.artistSubscription.update({
                    where: { artistId: validatedData.artistId },
                    data: {
                        planId: validatedData.planId,
                        status: 'active',
                        billingCycle: validatedData.billingCycle,
                        stripeSubscriptionId: paymentIntent.id,
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: new Date(Date.now() + (validatedData.billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
                        cancelAtPeriodEnd: false,
                        cancelledAt: null,
                    }
                });
            } else {
                // Create new subscription
                subscription = await tx.artistSubscription.create({
                    data: {
                        artistId: validatedData.artistId,
                        planId: validatedData.planId,
                        status: 'active',
                        billingCycle: validatedData.billingCycle,
                        stripeSubscriptionId: paymentIntent.id,
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: new Date(Date.now() + (validatedData.billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
                    }
                });
            }

            return subscription;
        });

        return NextResponse.json({
            message: 'Subscription activated successfully',
            subscription: result
        });

    } catch (error) {
        console.error('Error completing subscription:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                message: 'Validation error',
                errors: error.issues
            }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Error completing subscription'
        }, { status: 500 });
    }
}
