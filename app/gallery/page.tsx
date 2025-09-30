// app/gallery/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/url';
import GalleryGrid from '../../components/gallery/GalleryGrid';
import FiltersSidebar from '../../components/gallery/FiltersSidebar';
import FiltersMobileSheet from '../../components/gallery/FiltersMobileSheet';
import SortBar from '../../components/gallery/SortBar';
import ActiveChips from '../../components/gallery/ActiveChips';


// Types

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

// Fetch paintings with filters
async function getPaintings(searchParams: { [key: string]: string | string[] | undefined }): Promise<PagedResult<PaintingWithArtist>> {
    const base = await getBaseUrl();

    // Build query parameters
    const queryParams = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            if (Array.isArray(value)) {
                queryParams.set(key, value.join(','));
            } else {
                queryParams.set(key, value.toString());
            }
        }
    });

    const url = `${base}/api/paintings?${queryParams.toString()}`;

    const res = await fetch(url, {
        cache: "no-store", // Always fetch fresh data for filters
    });

    if (!res.ok) {
        throw new Error("Failed to fetch paintings");
    }

    return res.json();
}

// Fetch filter options
async function getFilterOptions(): Promise<FilterOptions> {
    const base = await getBaseUrl();

    const res = await fetch(`${base}/api/paintings/filter-options`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch filter options");
    }

    return res.json();
}

// Main Gallery Page Component
interface GalleryPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps): Promise<React.JSX.Element> {
    const resolvedSearchParams = await searchParams;
    const [paintingsData, filterOptions] = await Promise.all([
        getPaintings(resolvedSearchParams),
        getFilterOptions()
    ]);

    return (
        <div className="gallery-page">
            <div className="gallery-container">
                {/* Header */}
                <div className="gallery-header">
                    <h1 className="gallery-title">Галерия</h1>
                    <p className="gallery-subtitle">
                        Разгледайте {paintingsData.total} картини от талантливи български художници
                    </p>
                </div>

                {/* Mobile Filters Button - Fixed Position */}
                <div className="mobile-filters-trigger">
                    <Suspense fallback={<div className="loading-skeleton" />}>
                        <FiltersMobileSheet filterOptions={filterOptions} searchParams={resolvedSearchParams} />
                    </Suspense>
                </div>

                {/* Desktop Layout */}
                <div className="gallery-layout">
                    {/* Desktop Sidebar */}
                    <aside className="desktop-sidebar">
                        <Suspense fallback={<div className="loading-skeleton" />}>
                            <FiltersSidebar filterOptions={filterOptions} searchParams={resolvedSearchParams} />
                        </Suspense>
                    </aside>

                    {/* Main Content */}
                    <main className="gallery-main">
                        {/* Sort Bar */}
                        <div className="sort-section">
                            <Suspense fallback={<div className="loading-skeleton" />}>
                                <SortBar searchParams={resolvedSearchParams} totalItems={paintingsData.total} />
                            </Suspense>
                        </div>

                        {/* Active Filters */}
                        <div className="active-filters-section">
                            <Suspense fallback={<div className="loading-skeleton" />}>
                                <ActiveChips searchParams={resolvedSearchParams} />
                            </Suspense>
                        </div>

                        {/* Gallery Grid */}
                        <div className="gallery-grid-section">
                            <Suspense fallback={<div className="loading-skeleton" />}>
                                <GalleryGrid
                                    paintings={paintingsData.items}
                                    hasNext={paintingsData.hasNext}
                                    currentPage={paintingsData.page}
                                    totalPages={paintingsData.totalPages}
                                />
                            </Suspense>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}