import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";

// Schema за валидация на заявката
const CreateAdminSchema = z.object({
    email: z.string().email("Невалиден email адрес"),
    password: z.string().min(8, "Паролата трябва да бъде поне 8 символа"),
    name: z.string().min(2, "Името трябва да бъде поне 2 символа"),
    adminKey: z.string().min(10, "Невалиден admin ключ")
});

export async function POST(request: NextRequest) {
    try {
        // 1. Проверка за admin ключ от environment variables
        const validAdminKey = process.env.ADMIN_CREATION_KEY;
        if (!validAdminKey) {
            return NextResponse.json(
                { error: "Admin ключът не е конфигуриран" },
                { status: 500 }
            );
        }

        // 2. Валидация на данните
        const body = await request.json();
        const validatedData = CreateAdminSchema.parse(body);

        // 3. Проверка на admin ключа
        if (validatedData.adminKey !== validAdminKey) {
            return NextResponse.json(
                { error: "Невалиден admin ключ" },
                { status: 403 }
            );
        }

        // 4. Проверка дали вече има admin потребители
        const existingAdmins = await prisma.user.count({
            where: { role: "ADMIN" }
        });

        if (existingAdmins > 0) {
            return NextResponse.json(
                { error: "Вече съществуват admin потребители. Използвайте промоутване на съществуващ потребител." },
                { status: 400 }
            );
        }

        // 5. Проверка дали email-ът вече съществува
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Потребител с този email вече съществува" },
                { status: 409 }
            );
        }

        // 6. Хеширане на паролата
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);

        // 7. Създаване на admin потребителя и Account записа в transaction
        const result = await prisma.$transaction(async (tx) => {
            // Създаване на admin потребителя
            const adminUser = await tx.user.create({
                data: {
                    email: validatedData.email,
                    password: hashedPassword,
                    name: validatedData.name,
                    role: "ADMIN",
                    emailVerified: new Date() // Автоматично потвърждаваме email-а за admin
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true
                }
            });

            // Създаване на Account запис за credentials provider
            const account = await tx.account.create({
                data: {
                    userId: adminUser.id,
                    type: 'credentials',
                    provider: 'credentials',
                    providerAccountId: adminUser.id,
                }
            });

            return { adminUser, account };
        });

        const { adminUser, account } = result;

        // 8. Логване на създаването
        console.log("✅ ADMIN CREATED:", {
            userId: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            accountId: account.id,
            accountProvider: account.provider,
            timestamp: new Date(),
            ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
        });

        return NextResponse.json({
            success: true,
            message: "Admin акаунтът беше успешно създаден",
            user: adminUser
        });

    } catch (error) {
        console.error("Error creating admin:", error);

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
                { error: "Потребител с този email вече съществува" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Вътрешна грешка на сървъра" },
            { status: 500 }
        );
    }
}

// GET endpoint за проверка дали има admin потребители
export async function GET() {
    try {
        const adminCount = await prisma.user.count({
            where: { role: "ADMIN" }
        });

        return NextResponse.json({
            hasAdmins: adminCount > 0,
            adminCount
        });

    } catch (error) {
        console.error("Error checking admin count:", error);
        return NextResponse.json(
            { error: "Вътрешна грешка на сървъра" },
            { status: 500 }
        );
    }
}
