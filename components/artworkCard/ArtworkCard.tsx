
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    formatPriceBGN,
    formatPriceEUR
} from "@/lib/currency";
import { PaintingWithArtist } from "@/components/uploadArtwork/types";
import "./styles/artwork-card.css";
import "@/components/ui/styles/grayscale-toggle.css";

interface ArtworkCardProps {
    painting: PaintingWithArtist;
    showSold?: boolean;
    onCardClick?: (painting: PaintingWithArtist) => void;
}

export default function ArtworkCard({ painting, onCardClick }: ArtworkCardProps): React.JSX.Element {
    const router = useRouter();
    const cardRef = useRef<HTMLDivElement>(null);
    const [isSelected, setIsSelected] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isGrayscaleActive, setIsGrayscaleActive] = useState(false);

    // Check if painting is new (uploaded in last 10 days)
    const isNew = () => {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
        return new Date(painting.createdAt) > tenDaysAgo;
    };

    // Check if painting is on promotion using database fields
    const isOnPromotion = () => {
        return painting.isOnSale && painting.salePercentage && painting.salePercentage > 0;
    };

    const getPromotionPrice = () => {
        if (!isOnPromotion()) return null;
        return painting.finalPrice || painting.price;
    };

    const getOriginalPrice = () => {
        if (!isOnPromotion()) return null;
        return painting.originalPrice || painting.price;
    };

    const getDiscountPercentage = () => {
        if (!isOnPromotion()) return null;
        return painting.salePercentage;
    };

    const getFinalPrice = () => {
        return getPromotionPrice() || painting.price || 0;
    };

    const getDimensions = () => {
        if (painting.widthCm && painting.heightCm) {
            return `${painting.widthCm} x ${painting.heightCm}`;
        }
        return painting.dimensions || 'Неизвестни размери';
    };

    const handleCardClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (onCardClick) {
            onCardClick(painting);
        } else {
            // Default behavior - navigate to painting page using urlTitle
            const urlTitle = painting.urlTitle || painting.id;
            router.push(`/gallery/${urlTitle}`);
        }
    };

    const handleCardFocus = () => {
        setIsSelected(true);
    };

    const handleCardBlur = () => {
        setIsSelected(false);
    };

    // Handle click outside to deselect and reset grayscale
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
                setIsSelected(false);
                setIsGrayscaleActive(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle logo click to toggle grayscale
    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsGrayscaleActive(true);
    };

    // Note: Sold paintings filtering is now handled in ArtworkGallery component

    // Better image handling with fallbacks
    const hasImages = painting.images && painting.images.length > 0;
    const primaryImage = hasImages ? painting.images[0] : "/test.jpg"; // Use existing test image as fallback
    const thumbnailImage = hasImages && painting.images.length > 1 ? painting.images[1] : primaryImage;
    const additionalImagesCount = hasImages ? painting.images.length - 1 : 0;

    // Debug logging for missing images
    if (!hasImages) {
        console.warn(`ArtworkCard: No images found for painting "${painting.title}" (ID: ${painting.id})`);
    }

    return (
        <div
            ref={cardRef}
            className={`artwork-card grayscale-toggle ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isGrayscaleActive ? 'is-active' : ''}`}
            onClick={handleCardClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={handleCardFocus}
            onBlur={handleCardBlur}
            tabIndex={0}
            role="button"
            aria-label={`View painting ${painting.title} by ${painting.artist.user.name}`}
        >
            {/* Image Container */}
            <div className="artwork-image-container">
                <Image
                    src={primaryImage}
                    alt={painting.title || 'Artwork'}
                    fill
                    className="artwork-main-image grayscale-image"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                    onError={(e) => {
                        // Fallback to test image if primary image fails
                        const target = e.target as HTMLImageElement;
                        if (target.src !== "/test.jpg") {
                            target.src = "/test.jpg";
                        }
                    }}
                />

                {/* Sold Overlay - Removed, using small tag instead */}

                {/* Tags */}
                {isNew() && !painting.isSold && (
                    <span className="artwork-tag artwork-tag--new">Ново</span>
                )}
                {painting.isSold && (
                    <span className="artwork-tag artwork-tag--sold">Продадено</span>
                )}

                {/* Thumbnail Counter */}
                {additionalImagesCount > 0 && (
                    <div className="artwork-thumbnail-container">
                        <Image
                            src={thumbnailImage}
                            alt="Additional view"
                            width={24}
                            height={24}
                            className="artwork-thumbnail"
                            onError={(e) => {
                                // Fallback to test image if thumbnail fails
                                const target = e.target as HTMLImageElement;
                                if (target.src !== "/test.jpg") {
                                    target.src = "/test.jpg";
                                }
                            }}
                        />
                        <span className="artwork-image-count">+{additionalImagesCount}</span>
                    </div>
                )}

            </div>

            {/* Content */}
            <div className="artwork-content">
                <h3 className="artwork-title">{painting.title || 'Без заглавие'}</h3>

                <p className="artwork-artist">
                    от{" "}
                    <Link
                        href={`/artists/${painting.artistId || 'unknown'}`}
                        className="artwork-artist-link"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {painting.artist?.user?.name || 'Неизвестен художник'}
                    </Link>
                </p>

                <p className="artwork-dimensions">{getDimensions()}</p>

                {/* Pricing */}
                <div className="artwork-pricing">
                    {/* Original price - always present but hidden when no promotion */}
                    <p className={`artwork-price--original ${isOnPromotion() ? 'visible' : 'hidden'}`}>
                        {formatPriceBGN(getOriginalPrice() || painting.price)}
                    </p>

                    {/* Current price and discount tag */}
                    <div className="artwork-price-container">
                        <p className="artwork-price">
                            {formatPriceBGN(getFinalPrice())}
                        </p>
                        {isOnPromotion() && (
                            <span className="artwork-discount-tag">
                                -{getDiscountPercentage()}%
                            </span>
                        )}
                    </div>

                    <div className="artwork-price-eur-container">
                        <p className="artwork-price-eur">
                            {formatPriceEUR(getFinalPrice())}
                        </p>
                        {/* Logo Toggle Button - Mobile Only */}
                        <button
                            type="button"
                            className="grayscale-toggle-logo"
                            onClick={handleLogoClick}
                            aria-label="Покажи цветовете на картината"
                        >
                            <Image
                                src="/web-logo.svg"
                                width={20}
                                height={20}
                                alt="xArtify Logo"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
