import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET /api/tags
 * Извлича последните 30 тага за текущия потребител (автор)
 * Сортирани от най-новия към най-стария
 */
export async function GET(): Promise<NextResponse> {
    try {
        // Authentication check
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Check if user has artist profile or is admin
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { artistProfile: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isAuthorized = user.artistProfile || user.role === 'ADMIN';
        if (!isAuthorized) {
            return NextResponse.json({
                error: 'Only artists and admins can view tags'
            }, { status: 403 });
        }

        // Get artist ID
        const artistId = user.artistProfile?.id;
        if (!artistId && user.role === 'ADMIN') {
            // For admin users without artist profile, return empty array
            return NextResponse.json({
                tags: [],
                message: 'No artist profile found'
            });
        }

        if (!artistId) {
            return NextResponse.json({
                error: 'Artist profile is required to view tags'
            }, { status: 400 });
        }

        // Get the last 30 tags for this artist, ordered by newest first
        const tags = await prisma.tag.findMany({
            where: { artistId },
            orderBy: { createdAt: 'desc' },
            take: 30,
            select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return NextResponse.json({
            tags,
            count: tags.length,
            message: tags.length > 0 ? 'Tags retrieved successfully' : 'No tags found'
        });

    } catch (error) {
        console.error('Error retrieving tags:', error);

        if (error instanceof Error) {
            return NextResponse.json({
                error: 'Failed to retrieve tags',
                message: error.message,
            }, { status: 500 });
        }

        return NextResponse.json({
            error: 'Internal server error',
        }, { status: 500 });
    }
}
