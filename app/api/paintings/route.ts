// app/api/paintings/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth'; // Важно за защита на маршрута
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Импортираме authOptions

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

    if (!session || session.user.role !== 'ARTIST') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { title, description, imageUrl, price } = await req.json();

        const artistProfile = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!artistProfile) {
            return NextResponse.json({ message: 'Artist profile not found' }, { status: 404 });
        }

        const newPainting = await prisma.painting.create({
            data: {
                title,
                description,
                imageUrl,
                price,
                artistId: artistProfile.id,
            },
        });

        return NextResponse.json(newPainting, { status: 201 });
    } catch (error) {
        console.error('Error creating painting:', error);
        return NextResponse.json({ message: 'Error creating painting' }, { status: 500 });
    }
}