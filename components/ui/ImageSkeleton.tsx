"use client";

import { FC } from "react";
import SkeletonLoader from "./SkeletonLoader";

interface ImageSkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    aspectRatio?: "square" | "video" | "portrait" | "landscape" | "auto";
}

const ImageSkeleton: FC<ImageSkeletonProps> = ({
    className = "",
    width,
    height,
    aspectRatio = "auto"
}) => {
    const aspectRatioClasses = {
        square: "aspect-square",
        video: "aspect-video",
        portrait: "aspect-[3/4]",
        landscape: "aspect-[4/3]",
        auto: ""
    };

    const containerClasses = `
        relative overflow-hidden
        ${aspectRatioClasses[aspectRatio]}
        ${className}
    `.trim();

    return (
        <div className={containerClasses}>
            <SkeletonLoader
                className="absolute inset-0 w-full h-full"
                width={width}
                height={height}
                variant="rectangular"
                animation="pulse"
            />
            {/* Blur effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 opacity-50" />
        </div>
    );
};

export default ImageSkeleton;
