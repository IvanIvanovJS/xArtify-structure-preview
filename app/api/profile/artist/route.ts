// app/api/profile/artist/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// POST заявка за създаване или актуализиране на профил на артист
export async function POST(req: Request) {
    // Взимаме сесията на потребителя
    const session = await getServerSession(authOptions);

    // Ако няма сесия, връщаме грешка за неупълномощен достъп
    if (!session || !session.user) {
        return NextResponse.json({ error: "Неупълномощен достъп" }, { status: 401 });
    }

    // Взимаме ID-то на потребителя от сесията
    const userId = session.user.id;

    try {
        const { bio, phoneNumber } = await req.json();

        // Проверяваме дали вече има профил на артист
        let artistProfile = await prisma.artistProfile.findUnique({
            where: { userId },
        });

        if (!artistProfile) {
            // Създаваме нов профил
            artistProfile = await prisma.artistProfile.create({
                data: {
                    userId,
                    bio,
                    phoneNumber,
                },
            });
            // Няма нужда да обновяваме полето 'isArtist' в User,
            // тъй като съществуването на ArtistProfile показва, че е артист
        } else {
            // Обновяваме съществуващия профил
            artistProfile = await prisma.artistProfile.update({
                where: { userId },
                data: { bio, phoneNumber },
            });
        }

        return NextResponse.json(artistProfile, { status: 200 });
    } catch (error) {
        console.error('Error creating/updating artist profile:', error);
        return NextResponse.json({ error: 'Възникна грешка при създаване/актуализация на профила на артиста.' }, { status: 500 });
    }
}
