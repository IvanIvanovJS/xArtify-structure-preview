"use client";

import { useEffect, useRef } from "react";
import { useInterSplash } from "@/app/context/InterSplashContext";
import { usePathname } from "next/navigation";

export default function NavigationManager(): React.JSX.Element {
    const { isVisible, hideInterSplash } = useInterSplash();
    const pathname = usePathname();
    const previousPathnameRef = useRef<string | null>(null);
    const hasHiddenRef = useRef(false);

    // Track pathname changes and hide splash when navigation completes
    useEffect(() => {
        if (previousPathnameRef.current &&
            previousPathnameRef.current !== pathname &&
            isVisible &&
            !hasHiddenRef.current) {

            // Function to check if page is fully loaded and rendered
            const checkPageReady = (): void => {
                if (typeof window === 'undefined') return;

                // Check if DOM is ready
                if (document.readyState !== 'complete') {
                    return;
                }

                // Check if all images are loaded
                const images = document.querySelectorAll('img');
                const allImagesLoaded = Array.from(images).every(img => img.complete);

                // Check if all videos are loaded
                const videos = document.querySelectorAll('video');
                const allVideosReady = Array.from(videos).every(video =>
                    video.readyState >= 2 // HAVE_CURRENT_DATA
                );

                // Check for any pending fetch requests (more reliable than performance API)
                const hasActiveRequests = (window as unknown as { __pendingRequests?: number }).__pendingRequests &&
                    (window as unknown as { __pendingRequests?: number }).__pendingRequests! > 0;

                // If everything is ready, hide splash
                if (allImagesLoaded && allVideosReady && !hasActiveRequests) {
                    setTimeout(() => {
                        if (!hasHiddenRef.current) {
                            hasHiddenRef.current = true;
                            hideInterSplash();
                        }
                    }, 300); // Small delay to ensure smooth transition
                }
            };

            // Start checking page readiness
            const checkInterval = setInterval(() => {
                checkPageReady();
            }, 100);

            // Also check immediately
            checkPageReady();

            // Listen for load event as backup
            const handleLoad = () => {
                setTimeout(() => {
                    if (!hasHiddenRef.current) {
                        hasHiddenRef.current = true;
                        hideInterSplash();
                    }
                }, 500);
            };

            window.addEventListener('load', handleLoad, { once: true });

            // Cleanup interval and event listener after 4 seconds max
            setTimeout(() => {
                clearInterval(checkInterval);
                window.removeEventListener('load', handleLoad);

                // Force hide if still visible
                if (!hasHiddenRef.current) {
                    hasHiddenRef.current = true;
                    hideInterSplash();
                }
            }, 4000);
        }

        // Update previous pathname
        previousPathnameRef.current = pathname;
    }, [pathname, isVisible, hideInterSplash]);

    // Reset when splash becomes visible
    useEffect(() => {
        if (isVisible) {
            hasHiddenRef.current = false;
        }
    }, [isVisible]);

    // Fallback timeout
    useEffect(() => {
        if (!isVisible) return;

        const fallbackTimeout = setTimeout(() => {
            if (!hasHiddenRef.current) {
                hasHiddenRef.current = true;
                hideInterSplash();
            }
        }, 3000); // 3 seconds fallback

        return () => clearTimeout(fallbackTimeout);
    }, [isVisible, hideInterSplash]);

    return null as unknown as React.JSX.Element;
}