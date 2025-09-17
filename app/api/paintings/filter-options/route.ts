// app/api/paintings/filter-options/route.ts
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Simple in-memory cache for filter options (expires after 5 minutes)
let filterOptionsCache: { data: FilterOptions; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface FilterOptions {
    techniques: string[];
    subjects: string[];
    styles: string[];
    authors: Array<{ id: string; name: string }>;
    tags: string[];
    priceRange: {
        min: number;
        max: number;
    };
    sizeRange: {
        widthMin: number;
        widthMax: number;
        heightMin: number;
        heightMax: number;
    };
}

// GET /api/paintings/filter-options - Get all available filter options
export async function GET(): Promise<NextResponse> {
    try {
        // Check cache first
        if (filterOptionsCache && Date.now() - filterOptionsCache.timestamp < CACHE_DURATION) {
            return NextResponse.json(filterOptionsCache.data);
        }
        // Optimize: Use single query to get all painting data needed
        const [paintings, artists] = await Promise.all([
            // Get all paintings with only the fields we need
            prisma.painting.findMany({
                select: {
                    technique: true,
                    subject: true,
                    style: true,
                    price: true,
                    widthCm: true,
                    heightCm: true,
                    tags: true
                }
            }),
            // Get artists with user names
            prisma.artistProfile.findMany({
                select: {
                    id: true,
                    user: {
                        select: {
                            name: true
                        }
                    }
                },
                where: {
                    user: {
                        name: { not: null }
                    }
                }
            })
        ]);

        // Process data in memory (much faster than multiple DB queries)
        const uniqueTechniques = [...new Set(
            paintings.map(p => p.technique).filter(Boolean)
        )] as string[];

        const uniqueSubjects = [...new Set(
            paintings.map(p => p.subject).filter(Boolean)
        )] as string[];

        const uniqueStyles = [...new Set(
            paintings.map(p => p.style).filter(Boolean)
        )] as string[];

        // Extract all unique tags
        const allTags = paintings.flatMap(p => p.tags || []);
        const uniqueTags = [...new Set(allTags)].sort();

        // Calculate price range
        const prices = paintings.map(p => p.price).filter(price => price > 0);
        const priceRange = {
            min: prices.length > 0 ? Math.min(...prices) : 0,
            max: prices.length > 0 ? Math.max(...prices) : 10000
        };

        // Calculate size range
        const widths = paintings.map(p => p.widthCm).filter(width => width !== null && width > 0) as number[];
        const heights = paintings.map(p => p.heightCm).filter(height => height !== null && height > 0) as number[];

        const sizeRange = {
            widthMin: widths.length > 0 ? Math.min(...widths) : 0,
            widthMax: widths.length > 0 ? Math.max(...widths) : 220,
            heightMin: heights.length > 0 ? Math.min(...heights) : 0,
            heightMax: heights.length > 0 ? Math.max(...heights) : 220
        };

        // Prepare authors list
        const authors = artists.map(artist => ({
            id: artist.id,
            name: artist.user.name || 'Unknown Artist'
        }));

        const result: FilterOptions = {
            techniques: uniqueTechniques.sort(),
            subjects: uniqueSubjects.sort(),
            styles: uniqueStyles.sort(),
            authors: authors.sort((a, b) => a.name.localeCompare(b.name)),
            tags: uniqueTags,
            priceRange,
            sizeRange
        };

        // Cache the result
        filterOptionsCache = {
            data: result,
            timestamp: Date.now()
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching filter options:', error);
        return NextResponse.json(
            { message: 'Error fetching filter options', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
