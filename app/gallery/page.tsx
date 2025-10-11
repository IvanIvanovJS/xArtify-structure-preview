// app/gallery/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/url';
import GalleryClient from '../../components/gallery/GalleryClient';


// Types

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

interface FilterOptions {
    techniques: Array<{ name: string; count: number }>;
    subjects: Array<{ name: string; count: number }>;
    styles: Array<{ name: string; count: number }>;
    authors: Array<{ id: string; name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
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

// Metadata for SEO
export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
    title: "Галерия - xArtify",
    description: "Разгледайте нашата колекция от картини от талантливи български художници",
    openGraph: {
        title: "Галерия - xArtify",
        description: "Разгледайте нашата колекция от картини от талантливи български художници",
        images: ["/og-gallery.jpg"],
    },
};

// Fetch all paintings for client-side filtering
async function getAllPaintings(): Promise<PaintingWithArtist[]> {
    const base = await getBaseUrl();

    const res = await fetch(`${base}/api/paintings`, {
        // Use cache for better performance, but revalidate every 60 seconds
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch paintings");
    }

    const data = await res.json();
    return data.items || [];
}

// Fetch filter options
async function getFilterOptions(): Promise<FilterOptions> {
    const base = await getBaseUrl();

    const res = await fetch(`${base}/api/paintings/filter-options`, {
        // Cache filter options for 5 minutes since they change less frequently
        next: { revalidate: 300 },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch filter options");
    }

    return res.json();
}

// Main Gallery Page Component

export default async function GalleryPage(): Promise<React.JSX.Element> {
    const [paintings, filterOptions] = await Promise.all([
        getAllPaintings(),
        getFilterOptions()
    ]);

    return (
        <Suspense fallback={<div>Loading gallery...</div>}>
            <GalleryClient
                initialPaintings={paintings}
                filterOptions={filterOptions}
            />
        </Suspense>
    );
}