'use client';

import { useState, useEffect } from 'react';
import GalleryGrid from './GalleryGrid';
import FiltersSidebar from './FiltersSidebar';
import FiltersMobileSheet from './FiltersMobileSheet';
import './styles/gallery-page.css';

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

interface Filters {
    search: string;
    author: string;
    technique: string[];
    subject: string[];
    style: string[];
    priceRange: [number, number];
    widthRange: [number, number];
    heightRange: [number, number];
    tags: string[];
    sortBy: string;
    availability: string;
}

interface GalleryClientProps {
    initialPaintings: PaintingWithArtist[];
    filterOptions: FilterOptions;
}

export default function GalleryClient({ initialPaintings, filterOptions }: GalleryClientProps) {
    const [paintings, setPaintings] = useState<PaintingWithArtist[]>(initialPaintings);
    const [filteredPaintings, setFilteredPaintings] = useState<PaintingWithArtist[]>(initialPaintings);

    // Calculate max values from actual paintings
    const maxPrice = Math.max(...initialPaintings.map(p => p.isOnSale && p.finalPrice ? p.finalPrice : p.price));
    const maxWidth = Math.max(...initialPaintings.map(p => p.widthCm || 0));
    const maxHeight = Math.max(...initialPaintings.map(p => p.heightCm || 0));

    const [filters, setFilters] = useState<Filters>({
        search: '',
        author: '',
        technique: [],
        subject: [],
        style: [],
        priceRange: [0, maxPrice],
        widthRange: [0, maxWidth],
        heightRange: [0, maxHeight],
        tags: [],
        sortBy: 'newest',
        availability: ''
    });

    const handleFilterChange = (key: keyof Filters, value: string | string[] | [number, number]) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            author: '',
            technique: [],
            subject: [],
            style: [],
            priceRange: [0, maxPrice],
            widthRange: [0, maxWidth],
            heightRange: [0, maxHeight],
            tags: [],
            sortBy: 'newest',
            availability: ''
        });
    };

    // Apply filters instantly
    useEffect(() => {
        let filtered = [...paintings];

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(painting =>
                painting.title.toLowerCase().includes(searchLower) ||
                painting.artist.user.name?.toLowerCase().includes(searchLower) ||
                painting.description?.toLowerCase().includes(searchLower)
            );
        }

        // Author filter
        if (filters.author) {
            filtered = filtered.filter(painting =>
                painting.artist.user.name === filters.author
            );
        }

        // Technique filter
        if (filters.technique.length > 0) {
            filtered = filtered.filter(painting =>
                painting.technique && filters.technique.includes(painting.technique)
            );
        }

        // Subject filter
        if (filters.subject.length > 0) {
            filtered = filtered.filter(painting =>
                painting.subject && filters.subject.includes(painting.subject)
            );
        }

        // Style filter
        if (filters.style.length > 0) {
            filtered = filtered.filter(painting =>
                painting.style && filters.style.includes(painting.style)
            );
        }

        // Price range filter - apply only if different from default [0, maxPrice]
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) {
            filtered = filtered.filter(painting => {
                const price = painting.isOnSale && painting.finalPrice ? painting.finalPrice : painting.price;
                return price >= filters.priceRange[0] && price <= filters.priceRange[1];
            });
        }

        // Size filters - apply only if different from default [0, maxWidth/maxHeight]
        if (filters.widthRange[0] > 0 || filters.widthRange[1] < maxWidth) {
            filtered = filtered.filter(painting => {
                const width = painting.widthCm || 0;
                return width >= filters.widthRange[0] && width <= filters.widthRange[1];
            });
        }

        if (filters.heightRange[0] > 0 || filters.heightRange[1] < maxHeight) {
            filtered = filtered.filter(painting => {
                const height = painting.heightCm || 0;
                return height >= filters.heightRange[0] && height <= filters.heightRange[1];
            });
        }

        // Tags filter
        if (filters.tags.length > 0) {
            filtered = filtered.filter(painting =>
                filters.tags.some(tag => painting.tags.includes(tag))
            );
        }

        // Availability filter
        if (filters.availability) {
            switch (filters.availability) {
                case 'new':
                    const twoWeeksAgo = new Date();
                    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
                    filtered = filtered.filter(painting =>
                        new Date(painting.createdAt) > twoWeeksAgo
                    );
                    break;
                case 'promotion':
                    filtered = filtered.filter(painting => painting.isOnSale);
                    break;
                case 'sold':
                    filtered = filtered.filter(painting => painting.isSold);
                    break;
            }
        }

        // Apply sorting
        switch (filters.sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'price-low':
                filtered.sort((a, b) => {
                    const priceA = a.isOnSale && a.finalPrice ? a.finalPrice : a.price;
                    const priceB = b.isOnSale && b.finalPrice ? b.finalPrice : b.price;
                    return priceA - priceB;
                });
                break;
            case 'price-high':
                filtered.sort((a, b) => {
                    const priceA = a.isOnSale && a.finalPrice ? a.finalPrice : a.price;
                    const priceB = b.isOnSale && b.finalPrice ? b.finalPrice : b.price;
                    return priceB - priceA;
                });
                break;
            case 'title':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        setFilteredPaintings(filtered);
    }, [paintings, filters, maxPrice, maxWidth, maxHeight]);

    return (
        <div className="gallery-page">

            {/* Header */}
            <div className="gallery-header">
                <h1 className="gallery-title">Галерия</h1>
                <p className="gallery-subtitle">
                    Разгледайте нашата колекция от картини от талантливи български художници
                </p>
            </div>


            {/* Main Content */}
            <div className="gallery-main">
                {/* Desktop Sidebar */}
                <FiltersSidebar
                    filterOptions={filterOptions}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    clearFilters={clearFilters}
                />

                {/* Mobile Filters */}
                <div className="gallery-sidebar-mobile">
                    <FiltersMobileSheet
                        filterOptions={filterOptions}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        clearFilters={clearFilters}
                    />
                </div>

                {/* Gallery Grid */}
                <div className="gallery-content">
                    <GalleryGrid
                        paintings={filteredPaintings}
                        hasNext={false}
                        currentPage={1}
                        totalPages={1}
                        showSold={filters.availability === 'sold'}
                    />
                </div>
            </div>
        </div>
    );
}
