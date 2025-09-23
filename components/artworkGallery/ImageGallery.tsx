"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import "./styles/image-gallery.css";

interface ImageGalleryProps {
    images: string[];
    selectedIndex: number;
    onImageSelect: (index: number) => void;
    className?: string;
}

export default function ImageGallery({
    images,
    selectedIndex,
    onImageSelect,
    className = ""
}: ImageGalleryProps): React.JSX.Element {
    const [isExpanded, setIsExpanded] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const thumbnailsRef = useRef<HTMLDivElement>(null);

    if (!images || images.length <= 1) {
        return <></>;
    }

    const handleThumbnailClick = (index: number) => {
        onImageSelect(index);
    };

    const handleExpandClick = () => {
        setIsExpanded(!isExpanded);
    };

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

        if (isLeftSwipe && selectedIndex < images.length - 1) {
            onImageSelect(selectedIndex + 1);
        }
        if (isRightSwipe && selectedIndex > 0) {
            onImageSelect(selectedIndex - 1);
        }
    };

    return (
        <div className={`image-gallery ${className}`}>
            {/* Navigation Dots */}
            <div className="image-gallery-dots">
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={`image-gallery-dot ${selectedIndex === index ? 'active' : ''}`}
                        onClick={() => handleThumbnailClick(index)}
                        aria-label={`Go to image ${index + 1}`}
                    />
                ))}
            </div>

            {/* Thumbnails */}
            <div
                ref={thumbnailsRef}
                className={`image-gallery-thumbnails ${isExpanded ? 'expanded' : ''}`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {images.map((image, index) => (
                    <button
                        key={index}
                        className={`image-gallery-thumbnail ${selectedIndex === index ? 'active' : ''}`}
                        onClick={() => handleThumbnailClick(index)}
                        aria-label={`View image ${index + 1}`}
                    >
                        <Image
                            src={image}
                            alt={`View ${index + 1}`}
                            width={80}
                            height={80}
                            className="image-gallery-thumbnail-image"
                            sizes="80px"
                        />
                    </button>
                ))}
            </div>

            {images.length > 4 && (
                <button
                    className="image-gallery-expand-button"
                    onClick={handleExpandClick}
                    aria-label={isExpanded ? "Show fewer images" : "Show all images"}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`image-gallery-expand-icon ${isExpanded ? 'rotated' : ''}`}
                    >
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                    <span className="image-gallery-expand-text">
                        {isExpanded ? 'По-малко' : `+${images.length - 4} още`}
                    </span>
                </button>
            )}
        </div>
    );
}
