"use client";

import { useEffect, useRef } from "react";
import { useInterSplash } from "@/app/context/InterSplashContext";
import { usePathname } from "next/navigation";

export default function NavigationManager(): React.JSX.Element {
    const { isVisible, hideInterSplash } = useInterSplash();
    const pathname = usePathname();
    const previousPathnameRef = useRef<string | null>(null);
    const navigationStartTimeRef = useRef<number>(0);
    const hasHiddenRef = useRef(false);
    const pageLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Track when splash becomes visible
    useEffect(() => {
        if (isVisible) {
            hasHiddenRef.current = false;
            navigationStartTimeRef.current = Date.now();
            console.log('NavigationManager: Splash became visible');

            // Clear any existing timeout
            if (pageLoadTimeoutRef.current) {
                clearTimeout(pageLoadTimeoutRef.current);
            }
        }
    }, [isVisible]);

    // Track pathname changes - but don't hide splash immediately
    useEffect(() => {
        if (previousPathnameRef.current &&
            previousPathnameRef.current !== pathname &&
            isVisible &&
            !hasHiddenRef.current) {

            const navigationDuration = Date.now() - navigationStartTimeRef.current;
            console.log(`NavigationManager: Path changed from ${previousPathnameRef.current} to ${pathname} after ${navigationDuration}ms`);

            // Don't hide splash immediately - wait for page to actually load
            // This is similar to how Taomi handles slow loading
        }

        // Update previous pathname
        previousPathnameRef.current = pathname;
    }, [pathname, isVisible]);

    // Wait for actual page load events
    useEffect(() => {
        if (!isVisible || hasHiddenRef.current) return;

        const hideSplash = (): void => {
            if (!hasHiddenRef.current) {
                const totalDuration = Date.now() - navigationStartTimeRef.current;
                console.log(`NavigationManager: Hiding splash after ${totalDuration}ms`);
                hasHiddenRef.current = true;
                hideInterSplash();
            }
        };

        // Strategy 1: Wait for DOM to be ready
        const handleDOMReady = (): void => {
            // Wait a bit more to ensure all content is loaded
            pageLoadTimeoutRef.current = setTimeout(hideSplash, 500);
        };

        // Strategy 2: Wait for window load (all resources loaded)
        const handleWindowLoad = (): void => {
            pageLoadTimeoutRef.current = setTimeout(hideSplash, 300);
        };

        // Strategy 3: Wait for network idle (no active requests)
        const handleNetworkIdle = (): void => {
            pageLoadTimeoutRef.current = setTimeout(hideSplash, 200);
        };

        // Check current state
        if (document.readyState === 'complete') {
            handleWindowLoad();
        } else if (document.readyState === 'interactive') {
            handleDOMReady();
        } else {
            // Add listeners
            document.addEventListener('DOMContentLoaded', handleDOMReady, { once: true });
            window.addEventListener('load', handleWindowLoad, { once: true });
        }

        // Use requestIdleCallback for network idle detection
        if ('requestIdleCallback' in window) {
            requestIdleCallback(handleNetworkIdle, { timeout: 2000 });
        } else {
            setTimeout(handleNetworkIdle, 1000);
        }

        // Fallback timeout - much longer for slow connections
        const fallbackTimeout = setTimeout(() => {
            if (!hasHiddenRef.current) {
                console.log('NavigationManager: Fallback timeout triggered (15s)');
                hasHiddenRef.current = true;
                hideInterSplash();
            }
        }, 15000); // 15 seconds for very slow connections

        // Cleanup
        return () => {
            if (pageLoadTimeoutRef.current) {
                clearTimeout(pageLoadTimeoutRef.current);
            }
            clearTimeout(fallbackTimeout);
            document.removeEventListener('DOMContentLoaded', handleDOMReady);
            window.removeEventListener('load', handleWindowLoad);
        };
    }, [isVisible, hideInterSplash]);

    return null as unknown as React.JSX.Element;
}
