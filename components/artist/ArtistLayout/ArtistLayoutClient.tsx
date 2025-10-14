// components/artist/ArtistLayout/ArtistLayoutClient.tsx
"use client";

import { useState, JSX } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import "./styles/artist-layout.css";

interface ArtistProfile {
    id: string;
    bio: string | null;
    user: {
        name: string | null;
        email: string | null;
    };
    subscription: {
        plan: {
            name: string;
            displayName: string;
        } | null;
    } | null;
}

interface ArtistLayoutClientProps {
    children: React.ReactNode;
    artistProfile: ArtistProfile;
    unreadMessageCount: number;
}

const navigationItems = [
    { href: "/artist", label: "Dashboard", icon: "📊" },
    { href: "/artist/artworks", label: "Картини", icon: "🎨" },
    { href: "/artist/courses", label: "Курсове", icon: "📚" },
    { href: "/artist/analytics", label: "Аналитика", icon: "📈" },
    { href: "/artist/settings", label: "Настройки", icon: "⚙️" },
    { href: "/artist/messages", label: "Съобщения", icon: "💬" },
];

export default function ArtistLayoutClient({
    children,
    artistProfile,
    unreadMessageCount
}: ArtistLayoutClientProps): JSX.Element {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const toggleMobileMenu = (): void => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="artist-layout">
            {/* Mobile Header */}
            <header className="artist-mobile-header">
                <div className="artist-mobile-header-content">
                    <div className="artist-mobile-header-left">
                        <button
                            className="artist-mobile-menu-button"
                            onClick={toggleMobileMenu}
                            aria-label="Отвори меню"
                        >
                            <span className="artist-mobile-menu-icon"></span>
                            <span className="artist-mobile-menu-icon"></span>
                            <span className="artist-mobile-menu-icon"></span>
                        </button>
                        <h1 className="artist-mobile-title">Артист Портал</h1>
                    </div>
                    <div className="artist-mobile-header-right">
                        <div className="artist-profile-info">
                            <span className="artist-profile-name">
                                {artistProfile.user.name || "Артист"}
                            </span>
                            {artistProfile.subscription?.plan && (
                                <span className="artist-plan-badge">
                                    {artistProfile.subscription.plan.displayName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="artist-mobile-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleMobileMenu}
                    >
                        <motion.div
                            className="artist-mobile-menu"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="artist-mobile-menu-header">
                                <h2>Навигация</h2>
                                <button
                                    className="artist-mobile-menu-close"
                                    onClick={toggleMobileMenu}
                                    aria-label="Затвори меню"
                                >
                                    ✕
                                </button>
                            </div>
                            <nav className="artist-mobile-nav">
                                {navigationItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`artist-mobile-nav-item ${pathname === item.href ? "active" : ""}`}
                                        onClick={toggleMobileMenu}
                                    >
                                        <span className="artist-nav-icon">{item.icon}</span>
                                        <span className="artist-nav-label">{item.label}</span>
                                        {item.href === "/artist/messages" && unreadMessageCount > 0 && (
                                            <span className="artist-unread-badge">{unreadMessageCount}</span>
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="artist-layout-content">
                {/* Desktop Sidebar */}
                <aside className="artist-sidebar">
                    <div className="artist-sidebar-header">
                        <h2 className="artist-sidebar-title">Артист Портал</h2>
                        <div className="artist-profile-card">
                            <div className="artist-profile-avatar">
                                {artistProfile.user.name?.charAt(0)?.toUpperCase() || "A"}
                            </div>
                            <div className="artist-profile-details">
                                <h3 className="artist-profile-name">
                                    {artistProfile.user.name || "Артист"}
                                </h3>
                                <p className="artist-profile-email">
                                    {artistProfile.user.email}
                                </p>
                                {artistProfile.subscription?.plan && (
                                    <span className="artist-plan-badge">
                                        {artistProfile.subscription.plan.displayName}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <nav className="artist-nav">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`artist-nav-item ${pathname === item.href ? "active" : ""}`}
                            >
                                <span className="artist-nav-icon">{item.icon}</span>
                                <span className="artist-nav-label">{item.label}</span>
                                {item.href === "/artist/messages" && unreadMessageCount > 0 && (
                                    <span className="artist-unread-badge">{unreadMessageCount}</span>
                                )}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="artist-main">
                    <motion.div
                        className="artist-main-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
