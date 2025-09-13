import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema за валидация
const updateContentSchema = z.object({
    title: z.string().min(1).max(100),
    subtitle: z.string().min(1).max(500),
    image1Url: z.string().min(1).optional(),
    image2Url: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
    try {
        // Проверка за автентификация и admin права
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Необходима е автентификация" },
                { status: 401 }
            );
        }

        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Нямате права за тази операция" },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Валидация на данните
        const validatedData = updateContentSchema.parse(body);

        // Запазване в базата данни
        // Ще използваме прост подход - създаваме/обновяваме запис в таблица за контент
        const content = await prisma.content.upsert({
            where: { key: "courses-adv" },
            update: {
                title: validatedData.title,
                subtitle: validatedData.subtitle,
                image1Url: validatedData.image1Url,
                image2Url: validatedData.image2Url,
                updatedAt: new Date(),
            },
            create: {
                key: "courses-adv",
                title: validatedData.title,
                subtitle: validatedData.subtitle,
                image1Url: validatedData.image1Url,
                image2Url: validatedData.image2Url,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                title: content.title,
                subtitle: content.subtitle,
                image1Url: content.image1Url,
                image2Url: content.image2Url,
            },
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: "Невалидни данни",
                    details: error.issues.map(e => e.message)
                },
                { status: 400 }
            );
        }

        console.error("Update content error:", error);
        return NextResponse.json(
            { error: "Грешка при запазване на промените" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Връщаме текущия контент
        const content = await prisma.content.findUnique({
            where: { key: "courses-adv" },
        });

        return NextResponse.json({
            success: true,
            data: {
                title: content?.title || "500K",
                subtitle: content?.subtitle || "най-голямата и активна образователна общност в България",
                image1Url: content?.image1Url || "/test.jpg",
                image2Url: content?.image2Url || "/test2.jpg",
            },
        });

    } catch (error) {
        console.error("Get content error:", error);
        return NextResponse.json(
            { error: "Грешка при зареждане на контента" },
            { status: 500 }
        );
    }
}
