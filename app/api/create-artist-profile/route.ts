// app/api/create-artist-profile/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { bio, userId } = await req.json();

        // Проверяваме дали потребителят вече има профил на артист
        const existingProfile = await prisma.artistProfile.findUnique({
            where: { userId: userId },
        });

        if (existingProfile) {
            return NextResponse.json({ message: 'Artist profile already exists' }, { status: 409 });
        }

        // Създаваме новия профил на артист
        const newArtistProfile = await prisma.artistProfile.create({
            data: {
                bio,
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });

        return NextResponse.json(newArtistProfile);
    } catch (error) {
        console.error('Error creating artist profile:', error);
        return NextResponse.json({ message: 'Error creating artist profile' }, { status: 500 });
    }
}
