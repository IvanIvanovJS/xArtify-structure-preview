// app/gallery/_components/GalleryGrid.tsx
'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
// import PaintingCard from '@/components/PaintingCard'; // Not used in this component
import OptimizedImage from '@/components/ui/OptimizedImage';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

// Types
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

interface GalleryGridProps {
    paintings: PaintingWithArtist[];
    hasNext: boolean;
    currentPage: number;
    totalPages: number;
}

// Enhanced Painting Card for Gallery
function GalleryPaintingCard({ painting }: { painting: PaintingWithArtist }): React.JSX.Element {
    const router = useRouter();

    const handleClick = (): void => {
        const slug = painting.slug || painting.id;
        router.push(`/gallery/${slug}`);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
            className="gallery-painting-card"
        >
            <div className="painting-card-container" onClick={handleClick}>
                {/* Image */}
                <div className="painting-image-container">
                    <OptimizedImage
                        src={painting.images[0] || '/placeholder-painting.jpg'}
                        alt={painting.title}
                        width={300}
                        height={400}
                        className="painting-image"
                        priority={false}
                    />
                    {painting.isSold && (
                        <div className="sold-overlay">
                            <span className="sold-text">Продадена</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="painting-content">
                    <h3 className="painting-title">{painting.title}</h3>
                    <p className="painting-artist">{painting.artist.user.name || 'Неизвестен художник'}</p>

                    {/* Dimensions */}
                    {painting.dimensions && (
                        <p className="painting-dimensions">{painting.dimensions}</p>
                    )}

                    {/* Tags */}
                    {painting.tags && painting.tags.length > 0 && (
                        <div className="painting-tags">
                            {painting.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="painting-tag">
                                    {tag}
                                </span>
                            ))}
                            {painting.tags.length > 3 && (
                                <span className="painting-tag-more">+{painting.tags.length - 3}</span>
                            )}
                        </div>
                    )}

                    {/* Price */}
                    <div className="painting-price">
                        <span className="price-amount">{painting.price.toFixed(2)} лв.</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Loading Skeleton for Paintings
function PaintingSkeleton(): React.JSX.Element {
    return (
        <div className="gallery-painting-card">
            <div className="painting-card-container">
                <div className="painting-image-container">
                    <SkeletonLoader className="painting-image-skeleton" />
                </div>
                <div className="painting-content">
                    <SkeletonLoader className="painting-title-skeleton" />
                    <SkeletonLoader className="painting-artist-skeleton" />
                    <SkeletonLoader className="painting-price-skeleton" />
                </div>
            </div>
        </div>
    );
}

// Main Gallery Grid Component
export default function GalleryGrid({
    paintings,
    hasNext,
    currentPage,
    totalPages
}: GalleryGridProps): React.JSX.Element {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, startTransition] = useTransition();
    // const [loadingPaintings, setLoadingPaintings] = useState<PaintingWithArtist[]>([]); // Not used yet

    const handleShowMore = async (): Promise<void> => {
        if (isLoading || !hasNext) return;

        startTransition(async () => {
            try {
                // Build new search params with incremented page
                const newSearchParams = new URLSearchParams(searchParams.toString());
                newSearchParams.set('page', (currentPage + 1).toString());

                // Fetch next page
                const response = await fetch(`/api/paintings?${newSearchParams.toString()}`);
                if (!response.ok) throw new Error('Failed to fetch more paintings');

                await response.json(); // Response data - will be used later for pagination

                // Update URL with new page
                router.push(`/gallery?${newSearchParams.toString()}`);

                // Add new paintings to the list
                // setLoadingPaintings(data.items); // Will be implemented later
            } catch (error) {
                console.error('Error loading more paintings:', error);
                // You might want to show a toast notification here
            }
        });
    };

    // Show empty state if no paintings
    if (paintings.length === 0 && !isLoading) {
        return (
            <div className="empty-state">
                <div className="empty-state-content">
                    <h3>Няма намерени картини</h3>
                    <p>
                        Опитайте да промените филтрите или да изчистите всички филтри,
                        за да видите цялата колекция.
                    </p>
                    <button
                        onClick={() => router.push('/gallery')}
                        className="clear-filters-button"
                    >
                        Изчисти филтрите
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="gallery-grid-container">
            {/* Paintings Grid */}
            <div className="gallery-grid">
                <AnimatePresence mode="popLayout">
                    {paintings.map((painting) => (
                        <GalleryPaintingCard key={painting.id} painting={painting} />
                    ))}
                </AnimatePresence>
            </div>

            {/* Loading More Paintings */}
            {isLoading && (
                <div className="loading-more-paintings">
                    <div className="gallery-grid">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <PaintingSkeleton key={`loading-${index}`} />
                        ))}
                    </div>
                </div>
            )}

            {/* Show More Button */}
            {hasNext && !isLoading && (
                <div className="show-more-container">
                    <motion.button
                        onClick={handleShowMore}
                        className="show-more-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                    >
                        Покажи още картини
                    </motion.button>
                    <p className="pagination-info">
                        Страница {currentPage} от {totalPages}
                    </p>
                </div>
            )}

            {/* End of Results */}
            {!hasNext && paintings.length > 0 && (
                <div className="end-of-results">
                    <p>Това са всички налични картини</p>
                </div>
            )}
        </div>
    );
}
