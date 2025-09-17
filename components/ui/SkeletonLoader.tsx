"use client";

import { FC } from "react";

interface SkeletonLoaderProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: "text" | "rectangular" | "circular";
    lines?: number;
    animation?: "pulse" | "wave" | "none";
}

const SkeletonLoader: FC<SkeletonLoaderProps> = ({
    className = "",
    width,
    height,
    variant = "rectangular",
    lines = 1,
    animation = "pulse"
}) => {
    const baseClasses = "bg-gray-200 dark:bg-gray-700";
    const animationClasses = {
        pulse: "animate-pulse",
        wave: "animate-wave",
        none: ""
    };

    const variantClasses = {
        text: "h-4 rounded",
        rectangular: "rounded",
        circular: "rounded-full"
    };

    const skeletonClasses = `
        ${baseClasses}
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
    `.trim();

    const style = {
        ...(width && { width: typeof width === "number" ? `${width}px` : width }),
        ...(height && { height: typeof height === "number" ? `${height}px` : height })
    };

    if (variant === "text" && lines > 1) {
        return (
            <div className="space-y-2">
                {Array.from({ length: lines }, (_, index) => (
                    <div
                        key={index}
                        className={skeletonClasses}
                        style={{
                            ...style,
                            width: index === lines - 1 ? "75%" : "100%"
                        }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={skeletonClasses}
            style={style}
        />
    );
};

export default SkeletonLoader;
