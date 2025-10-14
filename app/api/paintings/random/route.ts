import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { Prisma } from '@prisma/client';

export const runtime = "nodejs";

interface PaintingWithArtist {
    id: string;
    title: string;
    urlTitle: string;
    description: string | null;
    dimensions: string | null;
    materials: string | null;
    images: string[];
    price: number;
    isSold: boolean;
    artistId: string;
    widthCm: number | null;
    heightCm: number | null;
    slug: string | null;
    technique: string | null;
    subject: string | null;
    tags: string[];
    style: string | null;
    isOnSale: boolean;
    salePercentage: number | null;
    finalPrice: number | null;
    originalPrice: number | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    artist: {
        id: string;
        bio: string | null;
        user: {
            name: string | null;
            email: string | null;
        };
    };
}

// GET /api/paintings/random - Get random paintings from other artists
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const excludeArtistId = searchParams.get('excludeArtistId');
        const excludePaintingId = searchParams.get('excludePaintingId');
        const limit = parseInt(searchParams.get('limit') || '8');

        // Build where clause
        const where: Prisma.PaintingWhereInput = {};

        // Exclude specific artist if provided
        if (excludeArtistId) {
            where.artistId = {
                not: excludeArtistId
            };
        }

        // Exclude specific painting if provided
        if (excludePaintingId) {
            where.id = {
                not: excludePaintingId
            };
        }

        // Fetch random paintings from other artists
        const paintings = await prisma.painting.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            },
            take: limit * 2, // Get more than needed to ensure we have enough after filtering
            include: {
                artist: {
                    select: {
                        id: true,
                        bio: true,
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        // Shuffle the results for random display
        const shuffledPaintings = paintings.sort(() => Math.random() - 0.5);

        // Take only the requested limit
        const limitedPaintings = shuffledPaintings.slice(0, limit);

        return NextResponse.json(limitedPaintings as PaintingWithArtist[]);

    } catch (error) {
        console.error('Error fetching random paintings:', error);
        return NextResponse.json(
            { message: 'Error fetching random paintings', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
