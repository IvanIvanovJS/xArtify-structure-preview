import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const GetArtistSchema = z.object({
  artistId: z.string().cuid(),
});

const FilterPaintingsSchema = z.object({
  technique: z.array(z.string()).optional(),
  subject: z.array(z.string()).optional(),
  style: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['newest', 'oldest', 'price-low', 'price-high', 'title']).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ artistId: string }> }
): Promise<NextResponse> {
  try {
    const { artistId } = await params;
    const { searchParams } = new URL(request.url);

    // Validate artistId
    const validatedParams = GetArtistSchema.parse({ artistId });

    // Parse and validate query parameters
    const queryParams = {
      technique: searchParams.getAll('technique'),
      subject: searchParams.getAll('subject'),
      style: searchParams.getAll('style'),
      tags: searchParams.getAll('tags'),
      priceMin: searchParams.get('priceMin'),
      priceMax: searchParams.get('priceMax'),
      sortBy: searchParams.get('sortBy'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    };

    const validatedQuery = FilterPaintingsSchema.parse(queryParams);

    // Check if artist exists
    const artist = await prisma.artistProfile.findUnique({
      where: { id: validatedParams.artistId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!artist) {
      return NextResponse.json(
        { message: "Artist not found" },
        { status: 404 }
      );
    }

    // Build painting filters
    const paintingFilters: {
      artistId: string;
      isSold: boolean;
      technique?: { in: string[] };
      subject?: { in: string[] };
      style?: { in: string[] };
      tags?: { hasSome: string[] };
      OR?: Array<{
        price?: { gte?: number; lte?: number };
        finalPrice?: { gte?: number; lte?: number; not?: null };
        isOnSale: boolean;
      }>;
    } = {
      artistId: validatedParams.artistId,
      isSold: false,
    };

    // Add technique filter
    if (validatedQuery.technique && validatedQuery.technique.length > 0) {
      paintingFilters.technique = {
        in: validatedQuery.technique,
      };
    }

    // Add subject filter
    if (validatedQuery.subject && validatedQuery.subject.length > 0) {
      paintingFilters.subject = {
        in: validatedQuery.subject,
      };
    }

    // Add style filter
    if (validatedQuery.style && validatedQuery.style.length > 0) {
      paintingFilters.style = {
        in: validatedQuery.style,
      };
    }

    // Add tags filter
    if (validatedQuery.tags && validatedQuery.tags.length > 0) {
      paintingFilters.tags = {
        hasSome: validatedQuery.tags,
      };
    }

    // Add price range filter
    if (validatedQuery.priceMin !== undefined || validatedQuery.priceMax !== undefined) {
      paintingFilters.OR = [];

      // For regular price
      const regularPriceFilter: {
        price?: { gte?: number; lte?: number };
        isOnSale: boolean;
      } = { isOnSale: false };
      if (validatedQuery.priceMin !== undefined) {
        regularPriceFilter.price = { gte: validatedQuery.priceMin };
      }
      if (validatedQuery.priceMax !== undefined) {
        regularPriceFilter.price = {
          ...regularPriceFilter.price,
          lte: validatedQuery.priceMax
        };
      }
      if (Object.keys(regularPriceFilter).length > 0) {
        regularPriceFilter.isOnSale = false;
        paintingFilters.OR.push(regularPriceFilter);
      }

      // For sale price
      const salePriceFilter: {
        finalPrice?: { gte?: number; lte?: number; not?: null };
        isOnSale: boolean;
      } = { isOnSale: true };
      if (validatedQuery.priceMin !== undefined) {
        salePriceFilter.finalPrice = { gte: validatedQuery.priceMin };
      }
      if (validatedQuery.priceMax !== undefined) {
        salePriceFilter.finalPrice = {
          ...salePriceFilter.finalPrice,
          lte: validatedQuery.priceMax
        };
      }
      if (Object.keys(salePriceFilter).length > 0) {
        salePriceFilter.isOnSale = true;
        salePriceFilter.finalPrice = { not: null };
        paintingFilters.OR.push(salePriceFilter);
      }
    }

    // Build orderBy
    let orderBy:
      | { createdAt: "desc" | "asc" }
      | { title: "asc" }
      | Array<{ isOnSale?: "asc" | "desc"; finalPrice?: "asc" | "desc"; price?: "asc" | "desc" }> = { createdAt: "desc" };
    if (validatedQuery.sortBy) {
      switch (validatedQuery.sortBy) {
        case 'newest':
          orderBy = { createdAt: "desc" };
          break;
        case 'oldest':
          orderBy = { createdAt: "asc" };
          break;
        case 'price-low':
          orderBy = [
            { isOnSale: "asc" },
            { finalPrice: "asc" },
            { price: "asc" },
          ];
          break;
        case 'price-high':
          orderBy = [
            { isOnSale: "desc" },
            { finalPrice: "desc" },
            { price: "desc" },
          ];
          break;
        case 'title':
          orderBy = { title: "asc" };
          break;
      }
    }

    // Pagination
    const page = validatedQuery.page || 1;
    const limit = validatedQuery.limit || 20;
    const skip = (page - 1) * limit;

    // Get paintings with filters
    const [paintings, totalCount] = await Promise.all([
      prisma.painting.findMany({
        where: paintingFilters,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          technique: true,
          subject: true,
          style: true,
          tags: true,
          widthCm: true,
          heightCm: true,
          isOnSale: true,
          salePercentage: true,
          finalPrice: true,
          originalPrice: true,
          createdAt: true,
        },
      }),
      prisma.painting.count({
        where: paintingFilters,
      }),
    ]);

    // Get filter options for the artist's paintings
    const filterOptions = await prisma.painting.findMany({
      where: {
        artistId: validatedParams.artistId,
        isSold: false,
      },
      select: {
        technique: true,
        subject: true,
        style: true,
        tags: true,
      },
    });

    const uniqueTechniques = Array.from(new Set(
      filterOptions.map(p => p.technique).filter(Boolean)
    ));
    const uniqueSubjects = Array.from(new Set(
      filterOptions.map(p => p.subject).filter(Boolean)
    ));
    const uniqueStyles = Array.from(new Set(
      filterOptions.map(p => p.style).filter(Boolean)
    ));
    const uniqueTags = Array.from(new Set(
      filterOptions.flatMap(p => p.tags)
    ));

    return NextResponse.json({
      artist: {
        id: artist.id,
        bio: artist.bio,
        user: artist.user,
      },
      paintings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      filterOptions: {
        techniques: uniqueTechniques,
        subjects: uniqueSubjects,
        styles: uniqueStyles,
        tags: uniqueTags,
      },
    });

  } catch (error) {
    console.error("Error fetching artist data:", error);

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
