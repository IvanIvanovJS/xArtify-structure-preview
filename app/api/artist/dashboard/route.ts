// app/api/artist/dashboard/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { limiterAutoRefresh, rateKey } from "@/lib/rateLimit";
import { DashboardStatsSchema } from "@/lib/validators/artist";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        // Rate limiting
        const session = await getServerSession(authOptions);
        const key = rateKey(req, session?.user?.id);
        const { success } = await limiterAutoRefresh.limit(key);

        if (!success) {
            return NextResponse.json({ message: "Твърде много заявки." }, { status: 429 });
        }

        // Authentication
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Не сте влезли в системата." }, { status: 401 });
        }

        // Get artist profile
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                subscription: {
                    include: { plan: true }
                }
            }
        });

        if (!artistProfile) {
            return NextResponse.json({ message: "Не сте артист." }, { status: 403 });
        }

        // Parse query parameters
        const { searchParams } = new URL(req.url);
        const query = Object.fromEntries(searchParams.entries());
        const validatedQuery = DashboardStatsSchema.parse(query);

        // Calculate date range
        const now = new Date();
        let startDate: Date;

        switch (validatedQuery.period) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        // Get dashboard statistics
        const [
            totalPaintings,
            publishedPaintings,
            draftPaintings,
            totalCourses,
            totalSales,
            recentSales,
            totalViews,
            profileViews
        ] = await Promise.all([
            // Total paintings count
            prisma.painting.count({
                where: { artistId: artistProfile.id }
            }),

            // Published paintings count
            prisma.painting.count({
                where: {
                    artistId: artistProfile.id,
                    status: 'published'
                }
            }),

            // Draft paintings count
            prisma.painting.count({
                where: {
                    artistId: artistProfile.id,
                    status: 'draft'
                }
            }),

            // Total courses count
            prisma.course.count({
                where: { artistId: artistProfile.id }
            }),

            // Total sales in period
            prisma.sale.count({
                where: {
                    artistId: artistProfile.id,
                    status: 'completed',
                    createdAt: { gte: startDate }
                }
            }),

            // Recent sales (last 5)
            prisma.sale.findMany({
                where: {
                    artistId: artistProfile.id,
                    status: 'completed'
                },
                include: {
                    painting: {
                        select: { title: true, images: true }
                    },
                    buyer: {
                        select: { name: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),

            // Total painting views in period
            prisma.paintingView.count({
                where: {
                    painting: { artistId: artistProfile.id },
                    createdAt: { gte: startDate }
                }
            }),

            // Profile views in period
            prisma.profileView.count({
                where: {
                    artistId: artistProfile.id,
                    createdAt: { gte: startDate }
                }
            })
        ]);

        // Calculate total revenue
        const revenueResult = await prisma.sale.aggregate({
            where: {
                artistId: artistProfile.id,
                status: 'completed',
                createdAt: { gte: startDate }
            },
            _sum: { salePrice: true }
        });

        const totalRevenue = revenueResult._sum.salePrice || 0;

        // Calculate commission earned
        const commissionResult = await prisma.sale.aggregate({
            where: {
                artistId: artistProfile.id,
                status: 'completed',
                createdAt: { gte: startDate }
            },
            _sum: { commissionAmount: true }
        });

        const totalCommission = commissionResult._sum.commissionAmount || 0;

        const dashboardData = {
            overview: {
                totalPaintings,
                publishedPaintings,
                draftPaintings,
                totalCourses,
                totalSales,
                totalRevenue,
                totalCommission,
                totalViews,
                profileViews
            },
            subscription: {
                plan: artistProfile.subscription?.plan || null,
                status: artistProfile.subscription?.status || null,
                billingCycle: artistProfile.subscription?.billingCycle || null,
                currentPeriodEnd: artistProfile.subscription?.currentPeriodEnd || null
            },
            recentSales,
            period: validatedQuery.period,
            startDate: startDate.toISOString(),
            endDate: now.toISOString()
        };

        return NextResponse.json(dashboardData);

    } catch (error) {
        console.error('Dashboard API Error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ message: 'Невалидни параметри.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

