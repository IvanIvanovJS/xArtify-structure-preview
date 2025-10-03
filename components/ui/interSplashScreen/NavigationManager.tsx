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


            // Hide splash when pathname changes (navigation completed)
            setTimeout(() => {
                if (!hasHiddenRef.current) {
                    hasHiddenRef.current = true;
                    hideInterSplash();
                }
            }, 200); // Small delay to ensure page is rendered
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