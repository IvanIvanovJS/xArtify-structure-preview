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

// Validation schema for painting creation
const CreatePaintingSchema = z.object({
    title: z.string().min(1, 'Title is required').max(140, 'Title too long'),
    urlTitle: z.string().min(1, 'URL title is required').max(100, 'URL title too long').regex(/^[a-zA-Zа-яА-Я0-9-]+$/, 'URL title can only contain letters, numbers and hyphens').optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    dimensions: z.string().max(100, 'Dimensions too long').optional(),
    materials: z.string().max(200, 'Materials too long').optional(),
    price: z.number().positive('Price must be positive').max(100000, 'Price too high'),
    images: z.array(z.string().url('Invalid image URL')).min(2, 'At least 2 images required').max(5, 'Maximum 5 images allowed'),
    technique: z.string().min(1, 'Technique is required'),
    subject: z.string().min(1, 'Subject is required'),
    style: z.string().min(1, 'Style is required'),
    tags: z.array(z.string()).min(1, 'At least one tag required').max(10, 'Maximum 10 tags allowed'),
    widthCm: z.number().positive('Width must be positive').max(500, 'Width too large'),
    heightCm: z.number().positive('Height must be positive').max(500, 'Height too large'),
    isOnSale: z.boolean().optional(),
    salePercentage: z.number().min(1, 'Sale percentage must be at least 1%').max(100, 'Sale percentage cannot exceed 100%').optional(),
    finalPrice: z.number().positive('Final price must be positive').optional(),
    originalPrice: z.number().positive('Original price must be positive').optional(),
});

// POST /api/paintings - Create new painting (artists and admins only)
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);

        // Authentication check
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Parse and validate request body
        const body = await request.json();
        const validatedData = CreatePaintingSchema.parse(body);

        // Get user with artist profile (RLS will handle authorization)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { artistProfile: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // For ADMIN users without artist profile, create one
        let artistId = user.artistProfile?.id;
        if (!artistId && user.role === 'ADMIN') {
            const adminArtistProfile = await prisma.artistProfile.create({
                data: {
                    userId: user.id,
                    bio: 'Admin user',
                    phoneNumber: '+359000000000',
                },
            });
            artistId = adminArtistProfile.id;
        }

        if (!artistId) {
            return NextResponse.json({
                error: 'Artist profile is required to create paintings'
            }, { status: 400 });
        }

        // Generate slug from title
        const slug = validatedData.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        // Check if slug already exists and make it unique
        let uniqueSlug = slug;
        let counter = 1;
        while (await prisma.painting.findUnique({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        // Generate urlTitle if not provided
        const urlTitle = validatedData.urlTitle || validatedData.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        // Check if urlTitle already exists and make it unique
        let uniqueUrlTitle = urlTitle;
        let urlCounter = 1;
        while (await prisma.painting.findUnique({ where: { urlTitle: uniqueUrlTitle } })) {
            uniqueUrlTitle = `${urlTitle}-${urlCounter}`;
            urlCounter++;
        }

        // Create painting with transaction for data consistency
        const newPainting = await prisma.$transaction(async (tx) => {
            const painting = await tx.painting.create({
                data: {
                    title: validatedData.title,
                    urlTitle: uniqueUrlTitle,
                    description: validatedData.description,
                    dimensions: validatedData.dimensions,
                    materials: validatedData.materials,
                    price: validatedData.price,
                    images: validatedData.images,
                    technique: validatedData.technique,
                    subject: validatedData.subject,
                    style: validatedData.style,
                    tags: validatedData.tags,
                    widthCm: validatedData.widthCm,
                    heightCm: validatedData.heightCm,
                    slug: uniqueSlug,
                    artistId: artistId,
                    isOnSale: validatedData.isOnSale || false,
                    salePercentage: validatedData.salePercentage || null,
                    finalPrice: validatedData.finalPrice || null,
                    originalPrice: validatedData.originalPrice || null,
                },
                include: {
                    artist: {
                        select: {
                            id: true,
                            bio: true,
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });

            return painting;
        });

        // Log successful creation
        console.log(`Painting created successfully: ${newPainting.id} by user ${userId}`);

        return NextResponse.json(newPainting, { status: 201 });

    } catch (error) {
        console.error('Error creating painting:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Validation failed',
                details: error.issues,
            }, { status: 400 });
        }

        if (error instanceof Error) {
            return NextResponse.json({
                error: 'Failed to create painting',
                message: error.message,
            }, { status: 500 });
        }

        return NextResponse.json({
            error: 'Internal server error',
        }, { status: 500 });
    }
}

