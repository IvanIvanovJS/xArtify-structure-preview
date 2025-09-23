"use client";

import { useState, useEffect } from 'react';
import { PaintingWithArtist } from '@/components/uploadArtwork/types';
import ArtworkCard from '@/components/artworkCard/ArtworkCard';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import "./styles/artwork-gallery.css";

interface ArtworkGalleryProps {
    paintings: PaintingWithArtist[];
    isLoading?: boolean;
    onPaintingClick?: (painting: PaintingWithArtist) => void;
    showSold?: boolean;
    className?: string;
}

export default function ArtworkGallery({
    paintings,
    isLoading = false,
    onPaintingClick,
    showSold = false,
    className = ""
}: ArtworkGalleryProps): React.JSX.Element {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={`artwork-gallery ${className}`}>
                <div className="artwork-gallery-grid">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <SkeletonLoader key={index} className="artwork-card-skeleton" />
                    ))}
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={`artwork-gallery ${className}`}>
                <div className="artwork-gallery-grid">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <SkeletonLoader key={index} className="artwork-card-skeleton" />
                    ))}
                </div>
            </div>
        );
    }

    if (!paintings || paintings.length === 0) {
        return (
            <div className={`artwork-gallery ${className}`}>
                <div className="artwork-gallery-empty">
                    <div className="artwork-gallery-empty-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21,15 16,10 5,21" />
                        </svg>
                    </div>
                    <h3 className="artwork-gallery-empty-title">Няма намерени картини</h3>
                    <p className="artwork-gallery-empty-description">
                        В момента няма картини, които отговарят на вашите критерии.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`artwork-gallery ${className}`}>
            <div className="artwork-gallery-grid">
                {paintings.map((painting) => (
                    <ArtworkCard
                        key={painting.id}
                        painting={painting}
                        showSold={showSold}
                        onCardClick={onPaintingClick}
                    />
                ))}
            </div>
        </div>
    );
}
