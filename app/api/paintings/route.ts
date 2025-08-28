// app/api/paintings/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'; // Важно за защита на маршрута
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Импортираме authOptions
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

// GET /api/paintings - Връща всички картини
export async function GET() {
    try {
        const paintings = await prisma.painting.findMany({
            include: {
                artist: {
                    select: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });
        return NextResponse.json(paintings);
    } catch (error) {
        console.error('Error fetching paintings:', error);
        return NextResponse.json({ message: 'Error fetching paintings' }, { status: 500 });
    }
}

// POST /api/paintings - Добавя нова картина (само за художници)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    // Проверяваме дали потребителят е влязъл
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        const { title,
            dimensions,
            materials,
            description,
            price,
            images,
        } = await req.json();

        // Проверяваме дали съществува профил на артист за текущия потребител
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { userId },
        });

        // Ако няма профил на артист, връщаме грешка
        if (!artistProfile) {
            return NextResponse.json({ message: 'Artist profile not found' }, { status: 403 });
        }

        const newPainting = await prisma.painting.create({
            data: {
                title,
                dimensions,
                materials,
                description,
                price,
                images,
                artistId: artistProfile.id,
            },
        });

        return NextResponse.json(newPainting, { status: 201 });
    } catch (error) {
        console.error('Error creating painting:', error);
        return NextResponse.json({ message: 'Error creating painting' }, { status: 500 });
    }
}
