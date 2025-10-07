"use client";

import { useState, ReactNode } from "react";
import "./styles/tooltip.css";

interface TooltipProps {
    content: string;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export function Tooltip({
    content,
    children,
    position = 'top',
    delay = 200
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const [isTouch, setIsTouch] = useState(false);

    const showTooltip = () => {
        const id = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        setTimeoutId(id);
    };

    const hideTooltip = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setIsVisible(false);
    };

    const handleTouchStart = () => {
        setIsTouch(true);
        showTooltip();
    };

    const handleTouchEnd = () => {
        // Keep tooltip visible for touch devices
        if (isTouch) {
            setTimeout(() => {
                setIsVisible(false);
            }, 3000); // Hide after 3 seconds
        }
    };

    const getPositionClass = () => {
        switch (position) {
            case 'top':
                return 'tooltip-top';
            case 'bottom':
                return 'tooltip-bottom';
            case 'left':
                return 'tooltip-left';
            case 'right':
                return 'tooltip-right';
            default:
                return 'tooltip-top';
        }
    };

    const getArrowClass = () => {
        switch (position) {
            case 'top':
                return 'tooltip-arrow-top';
            case 'bottom':
                return 'tooltip-arrow-bottom';
            case 'left':
                return 'tooltip-arrow-left';
            case 'right':
                return 'tooltip-arrow-right';
            default:
                return 'tooltip-arrow-top';
        }
    };

    return (
        <div
            className="tooltip-container"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {children}

            {isVisible && (
                <div className={`tooltip-content ${getPositionClass()}`}>
                    {content}
                    <div className={`tooltip-arrow ${getArrowClass()}`}></div>
                </div>
            )}
        </div>
    );
}

