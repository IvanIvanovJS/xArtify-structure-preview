
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    formatPriceBGN,
    formatPriceEUR
} from "@/lib/currency";
// Define the interface locally to match API response
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
import "./styles/artwork-card.css";

interface ArtworkCardProps {
    painting: PaintingWithArtist;
    showSold?: boolean;
    onCardClick?: (painting: PaintingWithArtist) => void;
}

export default function ArtworkCard({ painting, showSold = false, onCardClick }: ArtworkCardProps): React.JSX.Element {
    const router = useRouter();
    const cardRef = useRef<HTMLDivElement>(null);
    const [isSelected, setIsSelected] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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
        return getPromotionPrice() || painting.price;
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
            // Default behavior - navigate to painting page
            // On desktop, this will trigger the intercept route for modal
            const slug = painting.slug || painting.id;
            router.push(`/gallery/${slug}`);
        }
    };

    const handleCardFocus = () => {
        setIsSelected(true);
    };

    const handleCardBlur = () => {
        setIsSelected(false);
    };

    // Handle click outside to deselect
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
                setIsSelected(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Don't render if sold and not showing sold items
    if (painting.isSold && !showSold) {
        return <></>;
    }

    const primaryImage = painting.images[0] || "/placeholder-painting.jpg";
    const thumbnailImage = painting.images[1] || primaryImage;
    const additionalImagesCount = painting.images.length - 1;

    return (
        <div
            ref={cardRef}
            className={`artwork-card ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
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
                    alt={painting.title}
                    fill
                    className="artwork-main-image"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                />

                {/* Sold Overlay */}
                {painting.isSold && (
                    <div className="artwork-sold-overlay">
                        <span className="artwork-sold-text">Продадено</span>
                    </div>
                )}

                {/* Tags */}
                <div className="artwork-tags">
                    {isNew() && !painting.isSold && (
                        <span className="artwork-tag artwork-tag--new">Ново</span>
                    )}
                    {painting.isSold && (
                        <span className="artwork-tag artwork-tag--sold">Продадено</span>
                    )}
                </div>

                {/* Thumbnail Counter */}
                {additionalImagesCount > 0 && (
                    <div className="artwork-thumbnail-container">
                        <Image
                            src={thumbnailImage}
                            alt="Additional view"
                            width={24}
                            height={24}
                            className="artwork-thumbnail"
                        />
                        <span className="artwork-image-count">+{additionalImagesCount}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="artwork-content">
                <h3 className="artwork-title">{painting.title}</h3>

                <p className="artwork-artist">
                    от{" "}
                    <Link
                        href={`/artists/${painting.artistId}`}
                        className="artwork-artist-link"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {painting.artist.user.name || 'Неизвестен художник'}
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

                    <p className="artwork-price-eur">
                        {formatPriceEUR(getFinalPrice())}
                    </p>
                </div>
            </div>
        </div>
    );
}
