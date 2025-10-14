// app/gallery/_components/GalleryGrid.tsx
'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ArtworkCard from '@/components/artworkCard/ArtworkCard';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { type ViewMode } from '@/components/ui/ViewModeControls';

// Import the type from uploadArtwork types
import { PaintingWithArtist } from '@/components/uploadArtwork/types';

interface GalleryGridProps {
    paintings: PaintingWithArtist[];
    hasNext: boolean;
    currentPage: number;
    totalPages: number;
    showSold?: boolean;
    viewMode: ViewMode;
}

// Enhanced Painting Card for Gallery using new ArtworkCard
function GalleryPaintingCard({ painting, showSold }: { painting: PaintingWithArtist; showSold?: boolean }): React.JSX.Element {
    // Don't render sold paintings if showSold is false
    if (painting.isSold && !showSold) {
        return <></>;
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
        >
            <ArtworkCard
                painting={painting}
            />
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
    totalPages,
    showSold = false,
    viewMode
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

                // Update URL with new page - this will trigger a server-side fetch
                router.push(`/gallery?${newSearchParams.toString()}`);
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
        <>
            {/* Paintings Grid */}
            <div className={`gallery-grid ${viewMode === 'large' ? 'gallery-grid-large' : 'gallery-grid-normal'}`}>
                <AnimatePresence mode="popLayout">
                    {paintings.map((painting) => (
                        <GalleryPaintingCard
                            key={painting.id}
                            painting={painting}
                            showSold={showSold}
                        />
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
        </>
    );
}
