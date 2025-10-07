"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useInterSplash } from "@/app/context/InterSplashContext";
import { ReactNode } from "react";

interface NavigationLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    replace?: boolean;
    onClick?: () => void;
}

export default function NavigationLink({
    href,
    children,
    className,
    replace = false,
    onClick
}: NavigationLinkProps): React.JSX.Element {
    const pathname = usePathname();
    const router = useRouter();
    const { showInterSplash } = useInterSplash();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
        e.preventDefault();

        // Call custom onClick if provided
        if (onClick) {
            onClick();
        }

        // Don't show splash for same page navigation
        if (pathname === href) {
            return;
        }

        // Show splash immediately before navigation
        showInterSplash();

        // Navigate after a short delay to ensure splash is visible
        setTimeout(() => {
            if (replace) {
                router.replace(href);
            } else {
                router.push(href);
            }
        }, 50);
    };

    return (
        <Link
            href={href}
            className={className}
            onClick={handleClick}
        >
            {children}
        </Link>
    );
}

