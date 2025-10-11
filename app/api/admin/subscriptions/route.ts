import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

interface SubscriptionWithDetails {
    id: string;
    status: string;
    billingCycle: string;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    cancelledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    plan: {
        id: string;
        name: string;
        displayName: string;
        monthlyPrice: number;
        yearlyPrice: number;
        maxActivePaintings: number;
        commissionRate: number;
    };
    artist: {
        id: string;
        user: {
            id: string;
            name: string | null;
            email: string | null;
            createdAt: Date;
        };
    };
}

interface SubscriptionAnalytics {
    totalSubscriptions: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    expiredSubscriptions: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    averageSubscriptionValue: number;
    churnRate: number;
    totalRevenue: number;
    totalPayments: number;
    averagePaymentAmount: number;
    planDistribution: Array<{
        planName: string;
        count: number;
        percentage: number;
    }>;
    monthlyTrends: Array<{
        month: string;
        newSubscriptions: number;
        cancellations: number;
        revenue: number;
    }>;
    topPayingUsers: Array<{
        userId: string;
        userName: string | null;
        userEmail: string | null;
        totalPaid: number;
        paymentCount: number;
    }>;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Недостатъчни права за достъп" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const status = searchParams.get("status") || "";
        const planId = searchParams.get("planId") || "";
        const search = searchParams.get("search") || "";
        const includeAnalytics = searchParams.get("analytics") === "true";

        const skip = (page - 1) * limit;

        // Build where clause
        const whereClause: {
            status?: string;
            planId?: string;
            artist?: {
                user: {
                    OR: Array<{
                        name?: { contains: string; mode: "insensitive" };
                        email?: { contains: string; mode: "insensitive" };
                    }>;
                };
            };
        } = {};

        if (status) {
            whereClause.status = status;
        }

        if (planId) {
            whereClause.planId = planId;
        }

        if (search) {
            whereClause.artist = {
                user: {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } }
                    ]
                }
            };
        }

        // Get subscriptions with pagination
        const [subscriptions, totalCount] = await Promise.all([
            prisma.artistSubscription.findMany({
                where: whereClause,
                include: {
                    plan: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                            monthlyPrice: true,
                            yearlyPrice: true,
                            maxActivePaintings: true,
                            commissionRate: true
                        }
                    },
                    artist: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    createdAt: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            }),
            prisma.artistSubscription.count({ where: whereClause })
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        let analytics: SubscriptionAnalytics | null = null;

        if (includeAnalytics) {
            // Get analytics data
            const [
                totalSubscriptions,
                activeSubscriptions,
                cancelledSubscriptions,
                expiredSubscriptions,
                planDistribution,
                monthlyTrends,
                paymentStats,
                topPayingUsers
            ] = await Promise.all([
                prisma.artistSubscription.count(),
                prisma.artistSubscription.count({ where: { status: "active" } }),
                prisma.artistSubscription.count({ where: { status: "cancelled" } }),
                prisma.artistSubscription.count({ where: { status: "expired" } }),

                // Plan distribution
                prisma.artistSubscription.groupBy({
                    by: ["planId"],
                    _count: { planId: true }
                }),

                // Monthly trends (last 12 months)
                prisma.$queryRaw`
                    SELECT 
                        TO_CHAR(s."createdAt", 'YYYY-MM') as month,
                        COUNT(*) as new_subscriptions,
                        SUM(CASE WHEN s."status" = 'cancelled' THEN 1 ELSE 0 END) as cancellations,
                        SUM(
                            CASE 
                                WHEN s."billingCycle" = 'monthly' THEN p."monthlyPrice"
                                WHEN s."billingCycle" = 'yearly' THEN p."yearlyPrice"
                                ELSE 0
                            END
                        ) as revenue
                    FROM "ArtistSubscription" s
                    JOIN "SubscriptionPlan" p ON s."planId" = p.id
                    WHERE s."createdAt" >= NOW() - INTERVAL '12 months'
                    GROUP BY TO_CHAR(s."createdAt", 'YYYY-MM')
                    ORDER BY month DESC
                `,

                // Payment statistics
                prisma.paymentIntent.aggregate({
                    where: { status: "succeeded" },
                    _sum: { amount: true },
                    _count: { id: true },
                    _avg: { amount: true }
                }),

                // Top paying users
                prisma.$queryRaw`
                    SELECT 
                        u.id as "userId",
                        u.name as "userName",
                        u.email as "userEmail",
                        SUM(p.amount) as "totalPaid",
                        COUNT(p.id) as "paymentCount"
                    FROM "payment_intents" p
                    JOIN "User" u ON p."userId" = u.id
                    WHERE p.status = 'succeeded'
                    GROUP BY u.id, u.name, u.email
                    ORDER BY "totalPaid" DESC
                    LIMIT 10
                `
            ]);

            // Calculate revenue
            const activeSubs = await prisma.artistSubscription.findMany({
                where: { status: "active" },
                include: { plan: true }
            });

            const monthlyRevenue = activeSubs
                .filter(sub => sub.billingCycle === "monthly")
                .reduce((sum, sub) => sum + sub.plan.monthlyPrice, 0);

            const yearlyRevenue = activeSubs
                .filter(sub => sub.billingCycle === "yearly")
                .reduce((sum, sub) => sum + sub.plan.yearlyPrice, 0);

            const averageSubscriptionValue = totalSubscriptions > 0
                ? (monthlyRevenue + yearlyRevenue) / totalSubscriptions
                : 0;

            const churnRate = totalSubscriptions > 0
                ? (cancelledSubscriptions / totalSubscriptions) * 100
                : 0;

            // Calculate payment statistics
            const totalRevenue = paymentStats._sum.amount ? paymentStats._sum.amount / 100 : 0; // Convert from cents
            const totalPayments = paymentStats._count.id || 0;
            const averagePaymentAmount = paymentStats._avg.amount ? paymentStats._avg.amount / 100 : 0; // Convert from cents

            // Format plan distribution - get plan names separately
            const planIds = planDistribution.map(item => item.planId);
            const plans = await prisma.subscriptionPlan.findMany({
                where: { id: { in: planIds } },
                select: { id: true, displayName: true }
            });

            const planMap = new Map(plans.map(plan => [plan.id, plan.displayName]));

            const formattedPlanDistribution = planDistribution.map(item => ({
                planName: planMap.get(item.planId) || "Unknown",
                count: item._count.planId,
                percentage: totalSubscriptions > 0
                    ? (item._count.planId / totalSubscriptions) * 100
                    : 0
            }));

            analytics = {
                totalSubscriptions,
                activeSubscriptions,
                cancelledSubscriptions,
                expiredSubscriptions,
                monthlyRevenue,
                yearlyRevenue,
                averageSubscriptionValue,
                churnRate,
                totalRevenue,
                totalPayments,
                averagePaymentAmount,
                planDistribution: formattedPlanDistribution,
                monthlyTrends: (monthlyTrends as Array<{
                    month: string;
                    new_subscriptions: number;
                    cancellations: number;
                    revenue: number;
                }>).map(trend => ({
                    month: trend.month,
                    newSubscriptions: Number(trend.new_subscriptions),
                    cancellations: Number(trend.cancellations),
                    revenue: Number(trend.revenue)
                })),
                topPayingUsers: (topPayingUsers as Array<{
                    userId: string;
                    userName: string | null;
                    userEmail: string | null;
                    totalPaid: number;
                    paymentCount: number;
                }>).map(user => ({
                    userId: user.userId,
                    userName: user.userName,
                    userEmail: user.userEmail,
                    totalPaid: Number(user.totalPaid) / 100, // Convert from cents
                    paymentCount: Number(user.paymentCount)
                }))
            };
        }

        return NextResponse.json({
            subscriptions: subscriptions as SubscriptionWithDetails[],
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            analytics
        });

    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        return NextResponse.json(
            { error: "Грешка при зареждане на абонаменти" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Недостатъчни права за достъп" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { subscriptionId, action, reason } = body;

        if (!subscriptionId || !action) {
            return NextResponse.json(
                { error: "Липсват задължителни полета" },
                { status: 400 }
            );
        }

        const subscription = await prisma.artistSubscription.findUnique({
            where: { id: subscriptionId },
            include: { artist: { include: { user: true } } }
        });

        if (!subscription) {
            return NextResponse.json(
                { error: "Абонаментът не е намерен" },
                { status: 404 }
            );
        }

        let updatedSubscription;

        switch (action) {
            case "cancel":
                updatedSubscription = await prisma.artistSubscription.update({
                    where: { id: subscriptionId },
                    data: {
                        status: "cancelled",
                        cancelledAt: new Date(),
                        cancelAtPeriodEnd: true
                    }
                });
                break;

            case "reactivate":
                updatedSubscription = await prisma.artistSubscription.update({
                    where: { id: subscriptionId },
                    data: {
                        status: "active",
                        cancelledAt: null,
                        cancelAtPeriodEnd: false
                    }
                });
                break;

            case "expire":
                updatedSubscription = await prisma.artistSubscription.update({
                    where: { id: subscriptionId },
                    data: {
                        status: "expired",
                        cancelledAt: new Date()
                    }
                });
                break;

            default:
                return NextResponse.json(
                    { error: "Невалидно действие" },
                    { status: 400 }
                );
        }

        // Log admin action
        console.log(`Admin ${session.user.email} ${action} subscription ${subscriptionId} for user ${subscription.artist.user.email}. Reason: ${reason || "N/A"}`);

        return NextResponse.json({
            message: `Абонаментът беше успешно ${action === "cancel" ? "отменен" : action === "reactivate" ? "възстановен" : "изтекъл"}`,
            subscription: updatedSubscription
        });

    } catch (error) {
        console.error("Error updating subscription:", error);
        return NextResponse.json(
            { error: "Грешка при обновяване на абонамента" },
            { status: 500 }
        );
    }
}
