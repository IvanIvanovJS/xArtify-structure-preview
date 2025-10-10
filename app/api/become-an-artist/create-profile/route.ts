import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { z } from 'zod';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-07-30.basil",
});

const CreateArtistProfileSchema = z.object({
    name: z.string().min(1, 'Името е задължително'),
    email: z.string().email('Невалиден имейл адрес'),
    bio: z.string().max(750, 'Биографията не може да бъде по-дълга от 750 символа'),
    phoneNumber: z.string().min(1, 'Телефонният номер е задължителен'),
    birthDate: z.string().optional(),
    showBirthDate: z.boolean().default(false),
    country: z.string().optional(),
    city: z.string().optional(),
    isTwoFactorEnabled: z.boolean().default(false),
    faqs: z.array(z.object({
        question: z.string().min(1, 'Въпросът е задължителен'),
        answer: z.string().min(1, 'Отговорът е задължителен')
    })).default([]),
    userId: z.string().min(1, 'User ID е задължителен'),
    planId: z.string().optional(),
    paymentIntentId: z.string().optional()
});

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedData = CreateArtistProfileSchema.parse(body);

        // Check if user already has artist profile
        const existingProfile = await prisma.artistProfile.findUnique({
            where: { userId: validatedData.userId },
        });

        if (existingProfile) {
            return NextResponse.json({ message: 'Artist profile already exists' }, { status: 409 });
        }

        // Validate phone number
        const parsedNumber = parsePhoneNumberFromString(validatedData.phoneNumber);
        if (!parsedNumber || !parsedNumber.isValid()) {
            return NextResponse.json({ message: 'Invalid phone number' }, { status: 400 });
        }

        // Get the selected plan and payment info
        let selectedPlan = null;
        let paymentInfo = null;

        if (validatedData.planId) {
            selectedPlan = await prisma.subscriptionPlan.findUnique({
                where: { id: validatedData.planId }
            });
        }

        if (validatedData.paymentIntentId) {
            paymentInfo = await prisma.paymentIntent.findUnique({
                where: { id: validatedData.paymentIntentId }
            });
        }

        // Create artist profile with transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update user information
            const updatedUser = await tx.user.update({
                where: { id: validatedData.userId },
                data: {
                    name: validatedData.name,
                    email: validatedData.email,
                }
            });

            // Create artist profile
            const artistProfile = await tx.artistProfile.create({
                data: {
                    userId: validatedData.userId,
                    bio: validatedData.bio,
                    phoneNumber: parsedNumber.number,
                    birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
                    showBirthDate: validatedData.showBirthDate,
                    country: validatedData.country,
                    city: validatedData.city,
                    isTwoFactorEnabled: validatedData.isTwoFactorEnabled,
                }
            });

            // Create FAQs if provided
            if (validatedData.faqs.length > 0) {
                await tx.artistFAQ.createMany({
                    data: validatedData.faqs.map(faq => ({
                        artistId: artistProfile.id,
                        question: faq.question,
                        answer: faq.answer
                    }))
                });
            }

            // Create subscription based on plan and payment status
            if (selectedPlan) {
                if (selectedPlan.name === 'Hobby') {
                    // Create free subscription immediately
                    await tx.artistSubscription.create({
                        data: {
                            artistId: artistProfile.id,
                            planId: selectedPlan.id,
                            status: 'active',
                            billingCycle: 'monthly',
                        }
                    });
                } else if (paymentInfo && paymentInfo.status === 'succeeded') {
                    // Create subscription with payment info (handles both free and paid plans)
                    const metadata = paymentInfo.metadata as Record<string, string | number | boolean> | null;
                    const isFreePlan = metadata?.isFreePlan === true ||
                        metadata?.isFreePlan === 'true' ||
                        (paymentInfo.amount === 0 || paymentInfo.amount === 1);

                    let stripeCustomerId = null;
                    //TODO: Add stripeSubscriptionId
                    // let stripeSubscriptionId = null;
                    let currentPeriodStart = null;
                    let currentPeriodEnd = null;

                    if (!isFreePlan) {
                        // Create Stripe Customer
                        const customer = await stripe.customers.create({
                            email: validatedData.email,
                            name: validatedData.name,
                            metadata: {
                                userId: validatedData.userId,
                                artistId: artistProfile.id
                            }
                        });
                        stripeCustomerId = customer.id;

                        // Set period dates manually for now
                        currentPeriodStart = new Date();
                        currentPeriodEnd = new Date();
                        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + (paymentInfo.billingCycle === 'yearly' ? 12 : 1));
                    }

                    await tx.artistSubscription.create({
                        data: {
                            artistId: artistProfile.id,
                            planId: selectedPlan.id,
                            status: 'active',
                            billingCycle: paymentInfo.billingCycle,
                            paymentIntentId: isFreePlan ? null : paymentInfo.id,
                            stripeCustomerId,
                            stripeSubscriptionId: null,
                            currentPeriodStart,
                            currentPeriodEnd,
                        }
                    });
                } else {
                    // Create pending subscription for paid plans without payment
                    await tx.artistSubscription.create({
                        data: {
                            artistId: artistProfile.id,
                            planId: selectedPlan.id,
                            status: 'pending',
                            billingCycle: 'monthly',
                        }
                    });
                }
            }

            return { artistProfile, updatedUser, selectedPlan };
        });

        return NextResponse.json({
            message: 'Artist profile created successfully',
            artistProfile: result.artistProfile,
            selectedPlan: result.selectedPlan
        });

    } catch (error) {
        console.error('Error creating artist profile:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                message: 'Validation error',
                errors: error.issues
            }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Error creating artist profile'
        }, { status: 500 });
    }
}

