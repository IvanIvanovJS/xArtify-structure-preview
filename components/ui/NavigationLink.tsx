"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigationWithSplash } from "@/lib/hooks/useNavigationWithSplash";
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
    const { navigateWithSplash, replaceWithSplash } = useNavigationWithSplash();

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

        // Show splash and navigate
        if (replace) {
            replaceWithSplash(href);
        } else {
            navigateWithSplash(href);
        }
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

