"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface MainWrapperProps {
    children: ReactNode;
}

export default function MainWrapper({ children }: MainWrapperProps) {
    const pathname = usePathname();

    // Страници без хедър - без padding-top
    const noHeaderPages = ["/login", "/register", "/forgotten-password"];
    const shouldHidePadding = noHeaderPages.includes(pathname);

    return (
        <main className={`relative z-10 ${shouldHidePadding ? '' : 'pt-16 md:pt-30'} space-y-20`}>
            {children}
        </main>
    );
}
