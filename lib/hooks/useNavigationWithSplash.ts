"use client";

import { useRouter } from "next/navigation";
import { useInterSplash } from "@/app/context/InterSplashContext";

export function useNavigationWithSplash() {
    const router = useRouter();
    const { showInterSplash } = useInterSplash();

    const navigateWithSplash = (href: string): void => {
        // Show inter splash immediately
        showInterSplash();

        // Navigate after a short delay to ensure splash is visible
        setTimeout(() => {
            router.push(href);
        }, 50);
    };

    const replaceWithSplash = (href: string): void => {
        // Show inter splash immediately
        showInterSplash();

        // Replace after a short delay to ensure splash is visible
        setTimeout(() => {
            router.replace(href);
        }, 50);
    };

    return {
        navigateWithSplash,
        replaceWithSplash,
        router
    };
}

