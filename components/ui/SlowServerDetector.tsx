"use client";

import { useEffect, useRef } from "react";
import { useInterSplash } from "@/app/context/InterSplashContext";

export default function SlowServerDetector(): React.JSX.Element {
    const { isVisible, hideInterSplash } = useInterSplash();
    const hasHiddenRef = useRef(false);
    const slowServerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isVisible || hasHiddenRef.current) return;

        const hideSplash = (): void => {
            if (!hasHiddenRef.current) {
                console.log('SlowServerDetector: Hiding splash after slow server detection');
                hasHiddenRef.current = true;
                hideInterSplash();
            }
        };

        // For very slow local servers, show splash for at least 2 seconds
        // This prevents the flash of old content
        slowServerTimeoutRef.current = setTimeout(() => {
            if (!hasHiddenRef.current) {
                console.log('SlowServerDetector: Minimum time elapsed, checking if we can hide splash');

                // Check if page seems to be loaded
                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                    // Wait a bit more for any pending requests
                    setTimeout(hideSplash, 1000);
                } else {
                    // Page still loading, wait more
                    setTimeout(hideSplash, 2000);
                }
            }
        }, 2000); // Minimum 2 seconds for slow servers

        // Cleanup
        return () => {
            if (slowServerTimeoutRef.current) {
                clearTimeout(slowServerTimeoutRef.current);
            }
        };
    }, [isVisible, hideInterSplash]);

    // Reset when splash becomes visible
    useEffect(() => {
        if (isVisible) {
            hasHiddenRef.current = false;
            console.log('SlowServerDetector: Splash became visible');
        }
    }, [isVisible]);

    return null;
}
