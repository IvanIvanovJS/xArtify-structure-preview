import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// Schema за валидация на заявката
const PromoteUserSchema = z.object({
    userId: z.string().cuid("Невалиден ID на потребител"),
    newRole: z.enum(["USER", "ARTIST", "ADMIN"], {
        message: "Ролята трябва да бъде USER, ARTIST или ADMIN"
    }),
    reason: z.string().min(10, "Причината трябва да бъде поне 10 символа").max(500, "Причината не може да бъде повече от 500 символа")
});

export async function POST(request: NextRequest) {
    try {
        // 1. Проверка за автентификация
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Не сте автентикирани" },
                { status: 401 }
            );
        }

        // 2. Проверка за admin роля
        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Нямате права за тази операция" },
                { status: 403 }
            );
        }

        // 3. Валидация на данните
        const body = await request.json();
        const validatedData = PromoteUserSchema.parse(body);

        // 4. Проверка дали потребителят съществува
        const targetUser = await prisma.user.findUnique({
            where: { id: validatedData.userId },
            select: { id: true, email: true, name: true, role: true }
        });

        if (!targetUser) {
            return NextResponse.json(
                { error: "Потребителят не е намерен" },
                { status: 404 }
            );
        }

        // 5. Проверка дали не се опитва да промени собствената си роля
        if (targetUser.id === session.user.id) {
            return NextResponse.json(
                { error: "Не можете да променяте собствената си роля" },
                { status: 400 }
            );
        }

        // 6. Проверка дали ролята вече е същата
        if (targetUser.role === validatedData.newRole) {
            return NextResponse.json(
                { error: `Потребителят вече има роля ${validatedData.newRole}` },
                { status: 400 }
            );
        }

        // 7. Rate limiting - максимум 10 промени на час за един admin
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentChanges = await prisma.user.count({
            where: {
                id: session.user.id,
                updatedAt: { gte: oneHourAgo }
            }
        });

        if (recentChanges >= 10) {
            return NextResponse.json(
                { error: "Превишен лимит от промени на час" },
                { status: 429 }
            );
        }

        // 8. Аудит лог преди промяната
        const auditLog = {
            adminId: session.user.id,
            adminEmail: session.user.email,
            targetUserId: targetUser.id,
            targetUserEmail: targetUser.email,
            oldRole: targetUser.role,
            newRole: validatedData.newRole,
            reason: validatedData.reason,
            timestamp: new Date(),
            ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
        };

        // 9. Извършване на промяната в транзакция
        const result = await prisma.$transaction(async (tx) => {
            // Обновяване на ролята
            const updatedUser = await tx.user.update({
                where: { id: validatedData.userId },
                data: {
                    role: validatedData.newRole,
                    updatedAt: new Date()
                },
                select: { id: true, email: true, name: true, role: true }
            });

            // Записване на аудит лога (в бъдеще може да се добави отделна таблица за аудит)
            console.log("AUDIT LOG:", JSON.stringify(auditLog, null, 2));

            return updatedUser;
        });

        // 10. Успешен отговор
        return NextResponse.json({
            success: true,
            message: `Потребителят ${targetUser.email} беше успешно променен от ${targetUser.role} на ${validatedData.newRole}`,
            user: result
        });

    } catch (error) {
        console.error("Error promoting user:", error);

        // Обработка на валидационни грешки
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: "Невалидни данни",
                    details: error.issues.map(e => e.message)
                },
                { status: 400 }
            );
        }

        // Обработка на Prisma грешки
        if (error instanceof Error && error.message.includes("Unique constraint")) {
            return NextResponse.json(
                { error: "Възникна конфликт с данните" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Вътрешна грешка на сървъра" },
            { status: 500 }
        );
    }
}

// GET endpoint за получаване на списък с потребители (само за admin)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Нямате права за тази операция" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role") || "";

        const skip = (page - 1) * limit;

        // Конструиране на where условие
        const where: Prisma.UserWhereInput = {};

        if (search) {
            where.OR = [
                { email: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } }
            ];
        }

        if (role && ["USER", "ARTIST", "ADMIN"].includes(role)) {
            where.role = role;
        }

        // Получаване на потребители с пагинация
        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            enrollments: true
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            }),
            prisma.user.count({ where })
        ]);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Вътрешна грешка на сървъра" },
            { status: 500 }
        );
    }
}
