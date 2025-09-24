"use client";

import { useState, useEffect, useRef } from 'react';
import ArtworkCard from '@/components/artworkCard/ArtworkCard';
import { PaintingWithArtist } from '@/components/uploadArtwork/types';
import "./styles/artist-carousel.css";

interface ArtistCarouselProps {
    artistId: string;
    excludePaintingId?: string;
    className?: string;
}

export default function ArtistCarousel({
    artistId,
    excludePaintingId,
    className = ""
}: ArtistCarouselProps): React.JSX.Element {
    const [paintings, setPaintings] = useState<PaintingWithArtist[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchArtistPaintings = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (excludePaintingId) {
                    params.append('exclude', excludePaintingId);
                }
                params.append('limit', '8');

                const response = await fetch(`/api/paintings/artist/${artistId}?${params}`);
                if (response.ok) {
                    const data = await response.json();
                    setPaintings(data);
                }
            } catch (error) {
                console.error('Error fetching artist paintings:', error);
            } finally {
                setLoading(false);
            }
        };

        if (artistId) {
            fetchArtistPaintings();
        }
    }, [artistId, excludePaintingId]);

    // Touch handling for mobile swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && currentIndex < paintings.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
        if (isRightSwipe && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };


    if (loading) {
        return (
            <div className={`artist-carousel ${className}`}>
                <div className="artist-carousel-header">
                    <h2 className="artist-carousel-title">Още произведения от автора</h2>
                </div>
                <div className="artist-carousel-loading">
                    <div className="artist-carousel-skeleton">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="artist-carousel-skeleton-item">
                                <div className="artwork-card loading">
                                    <div className="artwork-image-container">
                                        <div className="artwork-main-image" style={{ filter: 'blur(2px)' }}></div>
                                    </div>
                                    <div className="artwork-content">
                                        <div className="artwork-title" style={{ height: '1.25rem', background: 'var(--color-muted)', borderRadius: '0.25rem', marginBottom: '0.5rem' }}></div>
                                        <div className="artwork-artist" style={{ height: '1rem', background: 'var(--color-muted)', borderRadius: '0.25rem', marginBottom: '0.5rem', width: '60%' }}></div>
                                        <div className="artwork-price" style={{ height: '1.125rem', background: 'var(--color-muted)', borderRadius: '0.25rem', width: '40%' }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (paintings.length === 0) {
        return <></>;
    }

    return (
        <div className={`artist-carousel ${className}`}>
            <div className="artist-carousel-header">
                <h2 className="artist-carousel-title">Още произведения от автора</h2>
                {paintings.length > 1 && (
                    <div className="artist-carousel-navigation">
                        <button
                            className="artist-carousel-nav-button"
                            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                            disabled={currentIndex === 0}
                            aria-label="Предишни произведения"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <button
                            className="artist-carousel-nav-button"
                            onClick={() => setCurrentIndex(Math.min(paintings.length - 1, currentIndex + 1))}
                            disabled={currentIndex >= paintings.length - 1}
                            aria-label="Следващи произведения"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <div
                className="artist-carousel-container"
                ref={carouselRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="artist-carousel-track"
                    style={{
                        transform: `translateX(-${currentIndex * (100 / Math.min(4, paintings.length))}%)`
                    }}
                >
                    {paintings.map((painting) => (
                        <div key={painting.id} className="artist-carousel-item">
                            <ArtworkCard
                                painting={painting}
                                showSold={true}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Dots Indicator */}
            {paintings.length > 1 && (
                <div className="artist-carousel-dots">
                    {paintings.map((_, index) => (
                        <button
                            key={index}
                            className={`artist-carousel-dot ${currentIndex === index ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Go to painting ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
