// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth"; // Ще използваме за да вземем потребителя
import { authOptions } from "@/lib/authOptions"; // Ще бъде създадено в бъдеще
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

// GET заявка за получаване на профилни данни
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Неупълномощен достъп" }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { artistProfile: true },
        });

        if (!user) {
            return NextResponse.json({ error: "Потребителят не е намерен." }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ error: 'Възникна грешка при зареждане на профила.' }, { status: 500 });
    }
}

// POST заявка за актуализация на профила (име и снимка)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Неупълномощен достъп" }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const { name, image } = await req.json();

        // Проверяваме дали поне едно от полетата е подадено
        if (!name && !image) {
            return NextResponse.json({ error: "Името или снимката са задължителни." }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, image }, // Обновяваме само подадените полета
        });

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error('Error updating user profile:', error);
        return NextResponse.json({ error: 'Възникна грешка при актуализация.' }, { status: 500 });
    }
}
