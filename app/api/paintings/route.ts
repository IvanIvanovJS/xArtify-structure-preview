// app/api/paintings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from "@/lib/prisma";
import { z } from 'zod';

export const runtime = "nodejs";

// API Contract Types

interface PagedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface PaintingWithArtist {
    id: string;
    title: string;
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
    createdAt: Date;
    updatedAt: Date;
    artist: {
        id: string;
        bio: string | null;
        user: {
            name: string | null;
        };
    };
}

// Validation schema for query parameters
const PaintingQuerySchema = z.object({
    q: z.string().optional(),
    author: z.string().optional(),
    technique: z.string().optional(),
    subject: z.string().optional(),
    style: z.string().optional(),
    tags: z.string().transform(val => val ? val.split(',') : []).optional(),
    priceMin: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
    priceMax: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
    widthMin: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
    heightMin: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
    widthMax: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
    heightMax: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'title_asc', 'title_desc']).optional(),
    page: z.string().transform(val => val ? parseInt(val) : 1).optional(),
    pageSize: z.string().transform(val => val ? parseInt(val) : 24).optional(),
});

// GET /api/paintings - Advanced filtering and pagination
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());

        // Validate query parameters
        const validatedParams = PaintingQuerySchema.parse(queryParams);
        const {
            q,
            author,
            technique,
            subject,
            style,
            tags = [],
            priceMin,
            priceMax,
            widthMin,
            heightMin,
            widthMax,
            heightMax,
            sort = 'newest',
            page = 1,
            pageSize = 24
        } = validatedParams;

        // Build Prisma where clause
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        // Search query (title, description, materials)
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { materials: { contains: q, mode: 'insensitive' } },
                { tags: { has: q } },
            ];
        }

        // Author filter
        if (author) {
            where.artist = {
                user: {
                    name: { contains: author, mode: 'insensitive' }
                }
            };
        }

        // Technique filter
        if (technique) {
            where.technique = technique;
        }

        // Subject filter
        if (subject) {
            where.subject = subject;
        }

        // Style filter
        if (style) {
            where.style = style;
        }

        // Tags filter (array contains)
        if (tags.length > 0) {
            where.tags = {
                hasSome: tags
            };
        }

        // Price range filter
        if (priceMin !== undefined || priceMax !== undefined) {
            where.price = {};
            if (priceMin !== undefined) where.price.gte = priceMin;
            if (priceMax !== undefined) where.price.lte = priceMax;
        }

        // Size range filters
        if (widthMin !== undefined || widthMax !== undefined) {
            where.widthCm = {};
            if (widthMin !== undefined) where.widthCm.gte = widthMin;
            if (widthMax !== undefined) where.widthCm.lte = widthMax;
        }

        if (heightMin !== undefined || heightMax !== undefined) {
            where.heightCm = {};
            if (heightMin !== undefined) where.heightCm.gte = heightMin;
            if (heightMax !== undefined) where.heightCm.lte = heightMax;
        }

        // Status filter (for now, we don't have a published field, so we'll show all)
        // In the future, you might want to add a published field to the Painting model

        // Build orderBy clause
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let orderBy: any = {};
        switch (sort) {
            case 'newest':
                orderBy = { createdAt: 'desc' };
                break;
            case 'price_asc':
                orderBy = { price: 'asc' };
                break;
            case 'price_desc':
                orderBy = { price: 'desc' };
                break;
            case 'title_asc':
                orderBy = { title: 'asc' };
                break;
            case 'title_desc':
                orderBy = { title: 'desc' };
                break;
            default:
                orderBy = { createdAt: 'desc' };
        }

        // Calculate pagination
        const skip = (page - 1) * pageSize;

        // Execute query with pagination
        const [paintings, total] = await Promise.all([
            prisma.painting.findMany({
                where,
                orderBy,
                skip,
                take: pageSize,
                include: {
                    artist: {
                        select: {
                            id: true,
                            bio: true,
                            user: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.painting.count({ where })
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(total / pageSize);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        // Return paginated result
        const result: PagedResult<PaintingWithArtist> = {
            items: paintings as PaintingWithArtist[],
            total,
            page,
            pageSize,
            totalPages,
            hasNext,
            hasPrev
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching paintings:', error);
        return NextResponse.json(
            { message: 'Error fetching paintings', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
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
