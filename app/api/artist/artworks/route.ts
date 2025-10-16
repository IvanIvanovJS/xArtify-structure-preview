// app/api/artist/artworks/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { limiterArtistRead, limiterArtistWrite, rateKey } from "@/lib/rateLimit";
import { CreateArtworkSchema, ArtworkFiltersSchema, ReorderArtworksSchema } from "@/lib/validators/artist";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        // Rate limiting
        const session = await getServerSession(authOptions);
        const key = rateKey(req, session?.user?.id);
        const { success } = await limiterArtistRead.limit(key);

        if (!success) {
            return NextResponse.json({ message: "Твърде много заявки." }, { status: 429 });
        }

        // Authentication
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Не сте влезли в системата." }, { status: 401 });
        }

        // Get artist profile
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!artistProfile) {
            return NextResponse.json({ message: "Не сте артист." }, { status: 403 });
        }

        // Parse query parameters
        const { searchParams } = new URL(req.url);
        const query = Object.fromEntries(searchParams.entries());
        const validatedQuery = ArtworkFiltersSchema.parse(query);

        // Build where clause
        const where: {
            artistId: string;
            status?: string;
            technique?: string;
            subject?: string;
            style?: string;
            isOnSale?: boolean;
            isSold?: boolean;
            OR?: Array<{
                title?: { contains: string; mode: 'insensitive' };
                description?: { contains: string; mode: 'insensitive' };
                tags?: { has: string };
            }>;
        } = {
            artistId: artistProfile.id
        };

        if (validatedQuery.status) {
            if (validatedQuery.status === 'sold') {
                where.isSold = true;
            } else if (validatedQuery.status === 'archived') {
                where.status = 'archived';
            } else {
                where.status = validatedQuery.status;
                where.isSold = false; // Ensure we don't get sold items when filtering by draft/published
            }
        }

        if (validatedQuery.technique) {
            where.technique = validatedQuery.technique;
        }

        if (validatedQuery.subject) {
            where.subject = validatedQuery.subject;
        }

        if (validatedQuery.style) {
            where.style = validatedQuery.style;
        }

        if (validatedQuery.isOnSale) {
            where.isOnSale = validatedQuery.isOnSale === "true";
        }

        if (validatedQuery.search) {
            where.OR = [
                { title: { contains: validatedQuery.search, mode: 'insensitive' } },
                { description: { contains: validatedQuery.search, mode: 'insensitive' } },
                { tags: { has: validatedQuery.search } }
            ];
        }

        // Get artworks with pagination
        const [artworks, totalCount] = await Promise.all([
            prisma.painting.findMany({
                where,
                include: {
                    views: {
                        select: { id: true },
                        take: 1
                    },
                    sales: {
                        where: { status: 'completed' },
                        select: { id: true }
                    }
                },
                orderBy: validatedQuery.sortBy && validatedQuery.sortOrder
                    ? { [validatedQuery.sortBy]: validatedQuery.sortOrder }
                    : { createdAt: 'desc' },
                skip: (validatedQuery.page - 1) * validatedQuery.limit,
                take: validatedQuery.limit
            }),

            prisma.painting.count({ where })
        ]);

        // Transform artworks to include view and sale counts and correct status
        const artworksWithStats = artworks.map(artwork => ({
            ...artwork,
            viewCount: artwork.views.length,
            saleCount: artwork.sales.length,
            status: artwork.isSold ? 'sold' : artwork.status
        }));

        const response = {
            artworks: artworksWithStats,
            pagination: {
                page: validatedQuery.page,
                limit: validatedQuery.limit,
                total: totalCount,
                pages: Math.ceil(totalCount / validatedQuery.limit)
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Artworks GET API Error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ message: 'Невалидни параметри.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        // Rate limiting
        const session = await getServerSession(authOptions);
        const key = rateKey(req, session?.user?.id);
        const { success } = await limiterArtistWrite.limit(key);

        if (!success) {
            return NextResponse.json({ message: "Твърде много заявки." }, { status: 429 });
        }

        // Authentication
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Не сте влезли в системата." }, { status: 401 });
        }

        // Get artist profile
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!artistProfile) {
            return NextResponse.json({ message: "Не сте артист." }, { status: 403 });
        }

        // Parse and validate request body
        const body = await req.json();
        const validatedData = CreateArtworkSchema.parse(body);

        // Generate URL title if not provided
        let urlTitle = validatedData.slug;
        if (!urlTitle) {
            urlTitle = validatedData.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 120);
        }

        // Ensure unique URL title
        let finalUrlTitle = urlTitle;
        let counter = 1;
        while (await prisma.painting.findUnique({ where: { urlTitle: finalUrlTitle } })) {
            finalUrlTitle = `${urlTitle}-${counter}`;
            counter++;
        }

        // Create artwork
        const artwork = await prisma.painting.create({
            data: {
                ...validatedData,
                artistId: artistProfile.id,
                urlTitle: finalUrlTitle,
                slug: validatedData.slug || finalUrlTitle
            }
        });

        return NextResponse.json(artwork, { status: 201 });

    } catch (error) {
        console.error('Artworks POST API Error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ message: 'Невалидни данни.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
    try {
        // Rate limiting
        const session = await getServerSession(authOptions);
        const key = rateKey(req, session?.user?.id);
        const { success } = await limiterArtistRead.limit(key);

        if (!success) {
            return NextResponse.json({ message: "Твърде много заявки." }, { status: 429 });
        }

        // Authentication
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Не сте влезли в системата." }, { status: 401 });
        }

        // Get artist profile
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!artistProfile) {
            return NextResponse.json({ message: "Не сте артист." }, { status: 403 });
        }

        // Check if this is a reorder request
        const { searchParams } = new URL(req.url);
        if (searchParams.get('action') === 'reorder') {
            const body = await req.json();
            const validatedData = ReorderArtworksSchema.parse(body);

            // Update artwork order
            const updatePromises = validatedData.artworks.map(({ id, index }) =>
                prisma.painting.updateMany({
                    where: {
                        id,
                        artistId: artistProfile.id
                    },
                    data: { updatedAt: new Date() } // This will be used for ordering
                })
            );

            await Promise.all(updatePromises);

            return NextResponse.json({ message: 'Порядъкът е обновен.' });
        }

        return NextResponse.json({ message: 'Невалидна операция.' }, { status: 400 });

    } catch (error) {
        console.error('Artworks PATCH API Error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ message: 'Невалидни данни.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

