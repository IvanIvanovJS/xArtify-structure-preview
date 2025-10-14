import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const GetArtistsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(['name', 'newest', 'oldest', 'paintings-count']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    };

    const validatedQuery = GetArtistsSchema.parse(queryParams);

    // Build where clause
    const whereClause: {
      user?: {
        name: {
          contains: string;
          mode: 'insensitive';
        };
      };
    } = {};

    if (validatedQuery.search) {
      whereClause.user = {
        name: {
          contains: validatedQuery.search,
          mode: 'insensitive',
        },
      };
    }

    // Build orderBy
    let orderBy:
      | { user: { name: 'asc' } }
      | { createdAt: 'asc' | 'desc' }
      | { paintings: { _count: 'desc' } } = { user: { name: 'asc' } };
    if (validatedQuery.sortBy) {
      switch (validatedQuery.sortBy) {
        case 'name':
          orderBy = { user: { name: 'asc' } };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'paintings-count':
          orderBy = { paintings: { _count: 'desc' } };
          break;
      }
    }

    // Pagination
    const page = validatedQuery.page || 1;
    const limit = validatedQuery.limit || 20;
    const skip = (page - 1) * limit;

    // Get artists with paintings count
    const [artists, totalCount] = await Promise.all([
      prisma.artistProfile.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: {
              paintings: {
                where: {
                  isSold: false,
                },
              },
            },
          },
        },
      }),
      prisma.artistProfile.count({
        where: whereClause,
      }),
    ]);

    // Transform data to include paintings count
    const artistsWithCount = artists.map(artist => ({
      id: artist.id,
      bio: artist.bio,
      user: artist.user,
      paintingsCount: artist._count.paintings,
      createdAt: artist.createdAt,
    }));

    return NextResponse.json({
      artists: artistsWithCount,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error("Error fetching artists:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid parameters", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
