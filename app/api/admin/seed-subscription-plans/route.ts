import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Check if plans already exist
        const existingPlans = await prisma.subscriptionPlan.findMany();
        if (existingPlans.length > 0) {
            return NextResponse.json({ message: 'Subscription plans already exist' }, { status: 409 });
        }

        // Create subscription plans
        const plans = await prisma.$transaction(async (tx) => {
            const freePlan = await tx.subscriptionPlan.create({
                data: {
                    name: 'Free',
                    displayName: 'Безплатен',
                    description: 'Всички основни функции, от които се нуждаете, за да започнете.',
                    monthlyPrice: 0,
                    yearlyPrice: 0,
                    yearlyDiscount: 0,
                    maxActivePaintings: 5,
                    commissionRate: 0.3, // 30%
                    analyticsAccess: 'minimal',
                    advertisingPriority: 'low',
                    directCommunication: false,
                    emailPromotions: false,
                    notifications: false,
                    unlimitedUploads: false,
                }
            });

            const mediumPlan = await tx.subscriptionPlan.create({
                data: {
                    name: 'Medium',
                    displayName: 'Среден',
                    description: 'Повече пространство и гъвкавост за мащабиране на сътрудничеството.',
                    monthlyPrice: 20,
                    yearlyPrice: 192, // 20 * 12 * 0.8 (20% discount)
                    yearlyDiscount: 0.2,
                    maxActivePaintings: 30,
                    commissionRate: 0.2, // 20%
                    analyticsAccess: 'extended',
                    advertisingPriority: 'high',
                    directCommunication: true,
                    emailPromotions: true,
                    notifications: true,
                    unlimitedUploads: false,
                }
            });

            const highPlan = await tx.subscriptionPlan.create({
                data: {
                    name: 'High',
                    displayName: 'Висок',
                    description: 'Инструменти за контрол, сигурност и поддръжка в мащаб.',
                    monthlyPrice: 200,
                    yearlyPrice: 1920, // 200 * 12 * 0.8 (20% discount)
                    yearlyDiscount: 0.2,
                    maxActivePaintings: -1, // Unlimited
                    commissionRate: 0.03, // 3%
                    analyticsAccess: 'full',
                    advertisingPriority: 'very_high',
                    directCommunication: true,
                    emailPromotions: true,
                    notifications: true,
                    unlimitedUploads: true,
                }
            });

            return [freePlan, mediumPlan, highPlan];
        });

        return NextResponse.json({
            message: 'Subscription plans created successfully',
            plans
        });

    } catch (error) {
        console.error('Error creating subscription plans:', error);
        return NextResponse.json({
            message: 'Error creating subscription plans'
        }, { status: 500 });
    }
}

