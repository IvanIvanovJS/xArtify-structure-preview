"use client";

import { useState, JSX } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Settings,
    ShoppingBag,
    Heart,
    BookOpen,
    CreditCard,
    Bell,
    Palette,
    Image as ImageIcon,
    BarChart3,
    Star,
    ArrowLeft
} from "lucide-react";
import "./styles/profile-dashboard.css";


interface ProfileLayoutProps {
    children: React.ReactNode;
}

interface NavItem {
    id: string;
    title: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    href: string;
    isArtistOnly?: boolean;
}

const navItems: NavItem[] = [
    {
        id: "become-artist",
        title: "Стани артист",
        icon: Star,
        href: "/create-artist-profile"
    },
    {
        id: "add-artwork",
        title: "Добави картина",
        icon: ImageIcon,
        href: "/upload-artwork",
        isArtistOnly: true
    },
    {
        id: "settings",
        title: "Настройки",
        icon: Settings,
        href: "/my-profile/settings"
    },
    {
        id: "orders",
        title: "Моите поръчки",
        icon: ShoppingBag,
        href: "/my-profile/orders"
    },
    {
        id: "favorites",
        title: "Любими произведения",
        icon: Heart,
        href: "/my-profile/favorites"
    },
    {
        id: "courses",
        title: "Моите курсове",
        icon: BookOpen,
        href: "/my-profile/courses"
    },
    {
        id: "wallet",
        title: "Портфейл",
        icon: CreditCard,
        href: "/my-profile/wallet"
    },
    {
        id: "notifications",
        title: "Известия",
        icon: Bell,
        href: "/my-profile/notifications"
    },
    {
        id: "artist-profile",
        title: "Профил на артист",
        icon: Palette,
        href: "/my-profile/artist",
        isArtistOnly: true
    },
    {
        id: "my-artworks",
        title: "Моите произведения",
        icon: ImageIcon,
        href: "/my-profile/artworks",
        isArtistOnly: true
    },
    {
        id: "analytics",
        title: "Аналитика",
        icon: BarChart3,
        href: "/my-profile/analytics",
        isArtistOnly: true
    }
];

export default function ProfileLayout({ children }: ProfileLayoutProps): JSX.Element {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Check if we're in dashboard mode (not on main profile page)
    const isDashboardMode = pathname !== "/my-profile";

    // For now, we'll show all items. In the future, this should be filtered based on user role
    const availableNavItems = navItems;

    if (!isDashboardMode) {
        // Return children without layout for main profile page
        return <>{children}</>;
    }

    return (
        <div className="profile-dashboard-layout">
            {/* Mobile Header */}
            <div className="profile-dashboard__mobile-header">
                <button
                    className="profile-dashboard__mobile-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle navigation menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <Link href="/my-profile" className="profile-dashboard__back-link">
                    <ArrowLeft size={20} />
                    <span>Назад към профила</span>
                </Link>
            </div>

            <div className="profile-dashboard__container">
                {/* Sidebar */}
                <aside className={`profile-dashboard__sidebar ${isMobileMenuOpen ? 'profile-dashboard__sidebar--open' : ''}`}>
                    <nav className="profile-dashboard__nav">
                        <ul className="profile-dashboard__nav-list">
                            {availableNavItems.map((item) => {
                                const isActive = pathname === item.href;
                                const IconComponent = item.icon;

                                return (
                                    <li key={item.id} className="profile-dashboard__nav-item">
                                        <Link
                                            href={item.href}
                                            className={`profile-dashboard__nav-link ${isActive ? 'profile-dashboard__nav-link--active' : ''}`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <IconComponent size={20} className="profile-dashboard__nav-icon" />
                                            <span className="profile-dashboard__nav-label">{item.title}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="profile-dashboard__main">
                    <div className="profile-dashboard__content">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="profile-dashboard__overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}