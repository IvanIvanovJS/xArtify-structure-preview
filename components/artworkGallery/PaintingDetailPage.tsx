"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PaintingWithArtist } from '@/components/uploadArtwork/types';
import { formatPriceBGN, formatPriceEUR } from '@/lib/currency';
import AddToCartButton from '@/components/cart/AddToCartButton';
import SocialShareButtons from '@/components/artworkGallery/SocialShareButtons';
import FavoriteButton from '@/components/artworkGallery/FavoriteButton';
import ImageGallery from '@/components/artworkGallery/ImageGallery';
import PaintingFeatures from '@/components/artworkGallery/PaintingFeatures';
import MeetTheArtist from '@/components/artworkGallery/MeetTheArtist';
import ArtistCarousel from '@/components/artworkGallery/ArtistCarousel';
import OtherArtistsCarousel from '@/components/artworkGallery/OtherArtistsCarousel';
import FAQSection from '@/components/artworkGallery/FAQSection';
import "./styles/painting-detail.css";

interface PaintingDetailPageProps {
    painting: PaintingWithArtist;
    isOwner?: boolean;
    className?: string;
}

export default function PaintingDetailPage({
    painting,
    isOwner = false,
    className = ""
}: PaintingDetailPageProps): React.JSX.Element {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={`painting-detail-loading ${className}`}>
                <div className="painting-detail-skeleton">
                    <div className="painting-detail-skeleton-image"></div>
                    <div className="painting-detail-skeleton-content">
                        <div className="painting-detail-skeleton-title"></div>
                        <div className="painting-detail-skeleton-artist"></div>
                        <div className="painting-detail-skeleton-price"></div>
                        <div className="painting-detail-skeleton-description"></div>
                    </div>
                </div>
            </div>
        );
    }

    const isOnPromotion = () => {
        return painting.isOnSale && painting.salePercentage && painting.salePercentage > 0;
    };

    const getPromotionPrice = () => {
        if (!isOnPromotion()) return null;
        return painting.finalPrice || painting.price;
    };

    const getOriginalPrice = () => {
        if (!isOnPromotion()) return null;
        // If originalPrice is stored, use it, otherwise calculate from finalPrice and percentage
        if (painting.originalPrice) {
            return painting.originalPrice;
        }
        // Calculate original price from final price and discount percentage
        if (painting.finalPrice && painting.salePercentage) {
            return painting.finalPrice / (1 - painting.salePercentage / 100);
        }
        return painting.price;
    };

    const getDiscountPercentage = () => {
        if (!isOnPromotion()) return null;
        return painting.salePercentage;
    };

    const getFinalPrice = () => {
        return getPromotionPrice() || painting.price;
    };

    const getDimensions = () => {
        if (painting.widthCm && painting.heightCm) {
            return `${painting.widthCm} x ${painting.heightCm} cm`;
        }
        return painting.dimensions || 'Неизвестни размери';
    };

    const handleBackClick = () => {
        router.back();
    };

    // Touch handling for main image swipe
    const handleMainImageTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleMainImageTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleMainImageTouchEnd = () => {
        if (!touchStart || !touchEnd || painting.images.length <= 1) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && selectedImageIndex < painting.images.length - 1) {
            setSelectedImageIndex(selectedImageIndex + 1);
        }
        if (isRightSwipe && selectedImageIndex > 0) {
            setSelectedImageIndex(selectedImageIndex - 1);
        }
    };

    const currentImage = painting.images[selectedImageIndex] || painting.images[0] || "/placeholder-painting.jpg";

    return (
        <div className={`painting-detail-page ${className}`}>
            {/* Back Button */}
            <div className="painting-detail-back">
                <button
                    onClick={handleBackClick}
                    className="painting-detail-back-button"
                    aria-label="Върни се назад"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    <span>Назад</span>
                </button>
            </div>

            <div className="painting-detail-container">
                {/* Image Section */}
                <div className="painting-detail-image-section">
                    <div
                        className="painting-detail-main-image"
                        onTouchStart={handleMainImageTouchStart}
                        onTouchMove={handleMainImageTouchMove}
                        onTouchEnd={handleMainImageTouchEnd}
                    >
                        <Image
                            src={currentImage}
                            alt={painting.title}
                            width={800}
                            height={1000}
                            className="painting-detail-image"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                            priority
                        />

                        {/* Sold Overlay */}
                        {painting.isSold && (
                            <div className="painting-detail-sold-overlay">
                                <span className="painting-detail-sold-text">Продадено</span>
                            </div>
                        )}

                    </div>

                    {/* Image Gallery */}
                    {painting.images.length > 1 && (
                        <ImageGallery
                            images={painting.images}
                            selectedIndex={selectedImageIndex}
                            onImageSelect={setSelectedImageIndex}
                        />
                    )}
                </div>

                {/* Content Section */}
                <div className="painting-detail-content">
                    {/* Header */}
                    <div className="painting-detail-header">
                        <h1 className="painting-detail-title">{painting.title}</h1>
                        <p className="painting-detail-artist">
                            от{" "}
                            <Link
                                href={`/artists/${painting.artistId}`}
                                className="painting-detail-artist-link"
                            >
                                {painting.artist.user.name || 'Неизвестен художник'}
                            </Link>
                        </p>
                    </div>


                    {/* Technical Details */}
                    <div className="painting-detail-details">
                        <div className="painting-detail-detail-item">
                            <span className="painting-detail-detail-label">Размери:</span>
                            <span className="painting-detail-detail-value">{getDimensions()}</span>
                        </div>

                        {painting.materials && (
                            <div className="painting-detail-detail-item">
                                <span className="painting-detail-detail-label">Материали:</span>
                                <span className="painting-detail-detail-value">{painting.materials}</span>
                            </div>
                        )}

                        {painting.technique && (
                            <div className="painting-detail-detail-item">
                                <span className="painting-detail-detail-label">Техника:</span>
                                <span className="painting-detail-detail-value">{painting.technique}</span>
                            </div>
                        )}

                        {painting.style && (
                            <div className="painting-detail-detail-item">
                                <span className="painting-detail-detail-label">Стил:</span>
                                <span className="painting-detail-detail-value">{painting.style}</span>
                            </div>
                        )}

                        {painting.subject && (
                            <div className="painting-detail-detail-item">
                                <span className="painting-detail-detail-label">Тема:</span>
                                <span className="painting-detail-detail-value">{painting.subject}</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {painting.description && (
                        <div className="painting-detail-description">
                            <h3 className="painting-detail-description-title">Описание</h3>
                            <p className="painting-detail-description-text">{painting.description}</p>
                        </div>
                    )}

                    {/* Tags */}
                    {painting.tags && painting.tags.length > 0 && (
                        <div className="painting-detail-tags">
                            <h3 className="painting-detail-tags-title">Тагове</h3>
                            <div className="painting-detail-tags-list">
                                {painting.tags.map((tag, index) => (
                                    <span key={index} className="painting-detail-tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pricing and Actions */}
                    <div className="painting-detail-pricing-actions">
                        {/* Pricing */}
                        <div className="painting-detail-pricing">
                            {isOnPromotion() && (
                                <div className="painting-detail-promotion-info">
                                    <div className="painting-detail-original-price">
                                        {formatPriceBGN(getOriginalPrice() || painting.price)}
                                    </div>
                                    <div className="painting-detail-discount-badge">
                                        -{getDiscountPercentage()}%
                                    </div>
                                </div>
                            )}

                            <div className="painting-detail-current-price">
                                {formatPriceBGN(getFinalPrice())}
                            </div>
                            <div className="painting-detail-price-eur">
                                {formatPriceEUR(getFinalPrice())}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="painting-detail-actions">
                            {isOwner ? (
                                <Link href={`/gallery/edit/${painting.id}`}>
                                    <button className="painting-detail-edit-button example-btn">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        Редактирай картина
                                    </button>
                                </Link>
                            ) : (
                                <>
                                    {!painting.isSold && (
                                        <AddToCartButton
                                            id={painting.id}
                                            title={painting.title}
                                            price={getFinalPrice()}
                                            dimensions={getDimensions()}
                                            artist={painting.artist.user.name || ""}
                                            image={currentImage}
                                            className="painting-detail-buy-button example-btn"
                                        />
                                    )}

                                    <FavoriteButton
                                        paintingId={painting.id}
                                        className="painting-detail-favorite-button"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Painting Features */}
                    <PaintingFeatures />

                    {/* Social Sharing */}
                    <div className="painting-detail-sharing">
                        <SocialShareButtons
                            title={painting.title}
                            description={painting.description || ''}
                            url={`${window.location.origin}/gallery/${painting.urlTitle || painting.id}`}
                        />
                    </div>

                </div>
            </div>

            {/* Meet The Artist - Full Width */}
            <MeetTheArtist
                artist={painting.artist}
                paintingTitle={painting.title}
            />

            {/* Artist Carousel - More works from the artist */}
            <ArtistCarousel
                artistId={painting.artistId}
                excludePaintingId={painting.id}
            />

            {/* Other Artists Carousel - Random paintings from other artists */}
            <OtherArtistsCarousel
                excludeArtistId={painting.artistId}
                excludePaintingId={painting.id}
            />

            {/* FAQ Section */}
            <FAQSection />
        </div>
    );
}
