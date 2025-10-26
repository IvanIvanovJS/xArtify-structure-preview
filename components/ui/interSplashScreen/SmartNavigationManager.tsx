"use client";

import { useEffect, useRef } from "react";
import { useInterSplash } from "@/app/context/InterSplashContext";
import { usePathname } from "next/navigation";

export default function SmartNavigationManager(): React.JSX.Element {
    const { isVisible, hideInterSplash } = useInterSplash();
    const pathname = usePathname();
    const previousPathnameRef = useRef<string | null>(null);
    const navigationStartTimeRef = useRef<number | null>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Track when navigation starts
    useEffect(() => {
        if (isVisible) {
            navigationStartTimeRef.current = Date.now();
        }
    }, [isVisible]);

    // Handle pathname changes - this means the new page has started loading
    useEffect(() => {
        // Check if pathname actually changed
        const pathnameChanged = previousPathnameRef.current && previousPathnameRef.current !== pathname;

        // Update previous pathname BEFORE any returns
        previousPathnameRef.current = pathname;

        // Only hide splash if pathname changed and splash is visible
        if (!pathnameChanged || !isVisible) {
            return;
        }

        // Clear any existing timeout
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
        }

        const navigationTime = navigationStartTimeRef.current
            ? Date.now() - navigationStartTimeRef.current
            : 0;

        // Calculate how much longer to show splash to meet minimum 300ms
        const minSplashTime = 300;
        const remainingTime = Math.max(0, minSplashTime - navigationTime);

        // Hide splash after ensuring minimum duration
        // Add extra 500ms to ensure page content is fully rendered
        const totalDelay = remainingTime + 500;

        hideTimeoutRef.current = setTimeout(() => {
            hideInterSplash();
        }, totalDelay);

    }, [pathname, isVisible, hideInterSplash]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, []);

    return null as unknown as React.JSX.Element;
}
