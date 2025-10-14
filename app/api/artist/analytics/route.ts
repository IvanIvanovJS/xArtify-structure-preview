// app/api/artist/analytics/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { limiter10perMin, rateKey } from "@/lib/rateLimit";
import { AnalyticsRangeSchema } from "@/lib/validators/artist";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        // Rate limiting
        const session = await getServerSession(authOptions);
        const key = rateKey(req, session?.user?.id);
        const { success } = await limiter10perMin.limit(key);

        if (!success) {
            return NextResponse.json({ message: "Твърде много заявки." }, { status: 429 });
        }

        // Authentication
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Не сте влезли в системата." }, { status: 401 });
        }

        // Get artist profile
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!artistProfile) {
            return NextResponse.json({ message: "Не сте артист." }, { status: 403 });
        }

        // Parse query parameters
        const { searchParams } = new URL(req.url);
        const query = Object.fromEntries(searchParams.entries());
        const validatedQuery = AnalyticsRangeSchema.parse(query);

        // Calculate date range
        const now = new Date();
        let startDate: Date;
        let endDate = now;

        if (validatedQuery.startDate && validatedQuery.endDate) {
            startDate = new Date(validatedQuery.startDate);
            endDate = new Date(validatedQuery.endDate);
        } else {
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
        }

        // Get comprehensive analytics
        const [
            salesData,
            paintingViews,
            profileViews,
            topPaintings,
            salesByPeriod,
            viewsByPeriod
        ] = await Promise.all([
            // Sales data
            prisma.sale.findMany({
                where: {
                    artistId: artistProfile.id,
                    status: 'completed',
                    createdAt: { gte: startDate, lte: endDate }
                },
                include: {
                    painting: {
                        select: { title: true, images: true }
                    },
                    buyer: {
                        select: { name: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),

            // Painting views
            prisma.paintingView.findMany({
                where: {
                    painting: { artistId: artistProfile.id },
                    createdAt: { gte: startDate, lte: endDate }
                },
                include: {
                    painting: {
                        select: { title: true }
                    }
                }
            }),

            // Profile views
            prisma.profileView.findMany({
                where: {
                    artistId: artistProfile.id,
                    createdAt: { gte: startDate, lte: endDate }
                }
            }),

            // Top paintings by views
            prisma.painting.findMany({
                where: { artistId: artistProfile.id },
                include: {
                    views: {
                        where: { createdAt: { gte: startDate, lte: endDate } },
                        select: { id: true }
                    },
                    sales: {
                        where: {
                            status: 'completed',
                            createdAt: { gte: startDate, lte: endDate }
                        },
                        select: { id: true, salePrice: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            }),

            // Sales by period (for charts)
            prisma.sale.groupBy({
                by: ['createdAt'],
                where: {
                    artistId: artistProfile.id,
                    status: 'completed',
                    createdAt: { gte: startDate, lte: endDate }
                },
                _count: { id: true },
                _sum: { salePrice: true, commissionAmount: true }
            }),

            // Views by period (for charts)
            prisma.paintingView.groupBy({
                by: ['createdAt'],
                where: {
                    painting: { artistId: artistProfile.id },
                    createdAt: { gte: startDate, lte: endDate }
                },
                _count: { id: true }
            })
        ]);

        // Calculate totals
        const totalRevenue = salesData.reduce((sum, sale) => sum + sale.salePrice, 0);
        const totalCommission = salesData.reduce((sum, sale) => sum + sale.commissionAmount, 0);
        const totalSales = salesData.length;
        const totalPaintingViews = paintingViews.length;
        const totalProfileViews = profileViews.length;

        // Transform top paintings
        const topPaintingsWithStats = topPaintings.map(painting => ({
            id: painting.id,
            title: painting.title,
            images: painting.images,
            viewCount: painting.views.length,
            saleCount: painting.sales.length,
            revenue: painting.sales.reduce((sum, sale) => sum + sale.salePrice, 0)
        }));

        // Sort by views
        topPaintingsWithStats.sort((a, b) => b.viewCount - a.viewCount);

        // Group sales by date for chart data
        const salesByDate = salesByPeriod.reduce((acc, sale) => {
            const date = sale.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { sales: 0, revenue: 0, commission: 0 };
            }
            acc[date].sales += sale._count.id;
            acc[date].revenue += sale._sum.salePrice || 0;
            acc[date].commission += sale._sum.commissionAmount || 0;
            return acc;
        }, {} as Record<string, { sales: number; revenue: number; commission: number }>);

        // Group views by date for chart data
        const viewsByDate = viewsByPeriod.reduce((acc, view) => {
            const date = view.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = 0;
            }
            acc[date] += view._count.id;
            return acc;
        }, {} as Record<string, number>);

        // Generate time series data for charts
        const timeSeries = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            timeSeries.push({
                date: dateStr,
                views: viewsByDate[dateStr] || 0,
                sales: salesByDate[dateStr]?.sales || 0,
                revenue: salesByDate[dateStr]?.revenue || 0
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const analyticsData = {
            overview: {
                totalViews: totalPaintingViews + totalProfileViews,
                profileViews: totalProfileViews,
                paintingViews: totalPaintingViews,
                totalSales: totalSales,
                totalRevenue: totalRevenue,
                totalCommission: totalCommission,
                averageSalePrice: totalSales > 0 ? totalRevenue / totalSales : 0,
                conversionRate: totalPaintingViews > 0 ? (totalSales / totalPaintingViews) * 100 : 0
            },
            timeSeries: timeSeries,
            topPaintings: topPaintingsWithStats.map(p => ({
                id: p.id,
                title: p.title,
                views: p.viewCount,
                sales: p.saleCount,
                revenue: p.revenue,
                images: p.images
            })),
            salesByMonth: [], // TODO: Implement if needed
            viewsBySource: [], // TODO: Implement if needed
            period: validatedQuery.period,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        };

        return NextResponse.json(analyticsData);

    } catch (error) {
        console.error('Analytics API Error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ message: 'Невалидни параметри.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

