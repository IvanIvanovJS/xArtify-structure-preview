import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getClientIP, checkRateLimit } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        // Проверка за admin права
        await requireAdmin();

        // Rate limiting
        const clientIP = getClientIP(request);
        if (!checkRateLimit(`admin-stats-${clientIP}`, 30, 60 * 1000)) { // 30 заявки на минута
            return NextResponse.json(
                { error: "Твърде много заявки. Моля, опитайте отново след малко." },
                { status: 429 }
            );
        }

        // Получаване на статистики в паралел
        const [
            totalUsers,
            totalArtists,
            totalAdmins,
            totalPaintings,
            totalCourses,
            totalEnrollments,
            recentUsers,
            recentPaintings,
            userRoleStats,
            monthlyStats
        ] = await Promise.all([
            // Общ брой потребители
            prisma.user.count(),

            // Брой художници
            prisma.user.count({ where: { role: "ARTIST" } }),

            // Брой админи
            prisma.user.count({ where: { role: "ADMIN" } }),

            // Общ брой картини
            prisma.painting.count(),

            // Общ брой курсове
            prisma.course.count(),

            // Общ брой записвания в курсове
            prisma.enrollment.count(),

            // Последни 5 регистрирани потребители
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true
                }
            }),

            // Последни 5 качени картини
            prisma.painting.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    price: true,
                    createdAt: true,
                    artist: {
                        select: {
                            user: {
                                select: {
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            }),

            // Статистики по роли
            prisma.user.groupBy({
                by: ["role"],
                _count: { role: true }
            }),

            // Статистики за последните 6 месеца
            prisma.$queryRaw`
                SELECT 
                    DATE_TRUNC('month', "createdAt") as month,
                    COUNT(*) as count,
                    'users' as type
                FROM "User" 
                WHERE "createdAt" >= NOW() - INTERVAL '6 months'
                GROUP BY DATE_TRUNC('month', "createdAt")
                ORDER BY month DESC
            `
        ]);

        // Обработка на месечните статистики
        const processedMonthlyStats = Array.isArray(monthlyStats)
            ? monthlyStats.map((stat: any) => ({
                month: stat.month,
                count: parseInt(stat.count),
                type: stat.type
            }))
            : [];

        // Изчисляване на допълнителни метрики
        const totalRevenue = await prisma.painting.aggregate({
            where: { isSold: true },
            _sum: { price: true }
        });

        const averagePaintingPrice = await prisma.painting.aggregate({
            _avg: { price: true }
        });

        const completionRate = totalEnrollments > 0
            ? await prisma.enrollment.count({ where: { isCompleted: true } }) / totalEnrollments * 100
            : 0;

        return NextResponse.json({
            overview: {
                totalUsers,
                totalArtists,
                totalAdmins,
                totalPaintings,
                totalCourses,
                totalEnrollments,
                totalRevenue: totalRevenue._sum.price || 0,
                averagePaintingPrice: averagePaintingPrice._avg.price || 0,
                completionRate: Math.round(completionRate * 100) / 100
            },
            recent: {
                users: recentUsers,
                paintings: recentPaintings
            },
            roleStats: userRoleStats.map(stat => ({
                role: stat.role,
                count: stat._count.role
            })),
            monthlyStats: processedMonthlyStats
        });

    } catch (error) {
        console.error("Error fetching admin stats:", error);

        if (error instanceof Error) {
            if (error.message.includes("Нямате права")) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 403 }
                );
            }
        }

        return NextResponse.json(
            { error: "Вътрешна грешка на сървъра" },
            { status: 500 }
        );
    }
}
