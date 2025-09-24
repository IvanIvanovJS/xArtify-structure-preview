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

// GET /api/paintings/artist/[artistId] - Get paintings by artist ID
export async function GET(
    request: NextRequest,
    { params }: { params: { artistId: string } }
): Promise<NextResponse> {
    try {
        const { artistId } = await params;
        const { searchParams } = new URL(request.url);
        const excludeId = searchParams.get('exclude');
        const limit = parseInt(searchParams.get('limit') || '8');

        if (!artistId) {
            return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
        }

        // Build where clause
        const where: Prisma.PaintingWhereInput = {
            artistId: artistId
        };

        // Exclude specific painting if provided
        if (excludeId) {
            where.id = {
                not: excludeId
            };
        }

        // Fetch paintings with random order for variety
        const paintings = await prisma.painting.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
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

        return NextResponse.json(shuffledPaintings as PaintingWithArtist[]);

    } catch (error) {
        console.error('Error fetching artist paintings:', error);
        return NextResponse.json(
            { message: 'Error fetching artist paintings', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
