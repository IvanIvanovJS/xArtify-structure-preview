"use client";

import { useEffect } from "react";
import { useInterSplash } from "@/app/context/InterSplashContext";
import { usePathname, useRouter } from "next/navigation";

export default function GlobalNavigationTracker(): React.JSX.Element {
    const { showInterSplash } = useInterSplash();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const handleClick = (event: MouseEvent): void => {
            const target = event.target as HTMLElement;

            // Check if clicked element is a link or has a link parent
            const link = target.closest('a[href]') as HTMLAnchorElement;

            if (link) {
                const href = link.getAttribute('href');

                // Skip if no href or if it's an external link
                if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                    return;
                }

                // Skip if it's the same page
                if (pathname === href) {
                    return;
                }

                // Skip if it's a hash link (same page anchor)
                if (href.startsWith('#')) {
                    return;
                }

                // Show splash for internal navigation
                showInterSplash();
            }
        };

        // Intercept router.push and router.replace to show splash
        const originalPush = router.push;
        const originalReplace = router.replace;

        router.push = (href: string, options?: { scroll?: boolean }) => {
            // Skip if it's the same page
            if (pathname !== href) {
                // Skip interSplash for filter operations (gallery page with or without query parameters)
                const isFilterOperation = pathname === '/gallery' && (href === '/gallery' || href.startsWith('/gallery?'));

                if (!isFilterOperation) {
                    showInterSplash();
                }
            }
            return originalPush.call(router, href, options);
        };

        router.replace = (href: string, options?: { scroll?: boolean }) => {
            // Skip if it's the same page
            if (pathname !== href) {
                // Skip interSplash for filter operations (gallery page with or without query parameters)
                const isFilterOperation = pathname === '/gallery' && (href === '/gallery' || href.startsWith('/gallery?'));

                if (!isFilterOperation) {
                    showInterSplash();
                }
            }
            return originalReplace.call(router, href, options);
        };

        // Add click listener to document
        document.addEventListener('click', handleClick, true);

        // Cleanup
        return () => {
            document.removeEventListener('click', handleClick, true);
            // Restore original methods
            router.push = originalPush;
            router.replace = originalReplace;
        };
    }, [showInterSplash, pathname, router]);

    return null as unknown as React.JSX.Element;
}
