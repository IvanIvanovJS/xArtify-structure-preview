"use client";

import { FC, useState } from "react";
import Image from "next/image";
import ImageSkeleton from "./ImageSkeleton";

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
    width?: number;
    height?: number;
    priority?: boolean;
    quality?: number;
    placeholder?: "blur" | "empty";
    blurDataURL?: string;
    onLoad?: () => void;
    onError?: () => void;
}

// Генериране на blur placeholder
const generateBlurDataURL = (width: number = 10, height: number = 10): string => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        // Създаваме градиент за blur ефект
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#f3f4f6');
        gradient.addColorStop(0.5, '#e5e7eb');
        gradient.addColorStop(1, '#d1d5db');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    return canvas.toDataURL();
};

const OptimizedImage: FC<OptimizedImageProps> = ({
    src,
    alt,
    className = "",
    fill = false,
    width,
    height,
    priority = false,
    quality = 75,
    placeholder = "blur",
    blurDataURL,
    onLoad,
    onError
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
        onLoad?.();
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
        onError?.();
    };

    // Default blur placeholder
    const defaultBlurDataURL = blurDataURL || generateBlurDataURL();

    if (hasError) {
        return (
            <div className={`relative bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
                <div className="text-gray-400 text-sm text-center p-4">
                    <div className="mb-2">📷</div>
                    <div>Грешка при зареждане</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {/* Skeleton loader докато снимката се зарежда */}
            {isLoading && (
                <ImageSkeleton
                    className="absolute inset-0 z-10"
                    width={fill ? "100%" : width}
                    height={fill ? "100%" : height}
                    aspectRatio={fill ? "auto" : "auto"}
                />
            )}

            <Image
                src={src}
                alt={alt}
                fill={fill}
                width={fill ? undefined : width}
                height={fill ? undefined : height}
                priority={priority}
                quality={quality}
                placeholder={placeholder}
                blurDataURL={placeholder === "blur" ? defaultBlurDataURL : undefined}
                onLoad={handleLoad}
                onError={handleError}
                className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                style={{
                    objectFit: 'cover'
                }}
            />
        </div>
    );
};

export default OptimizedImage;
