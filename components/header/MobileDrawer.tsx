"use client";

import Link from "next/link";
import { JSX, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import NavigationLink from "../ui/interSplashScreen/NavigationLink";
import {
    User2,
    Heart,
    LogIn,
    LogOut,
    Shield,
    X,
    Home,
    Palette,
    Users,
    BookOpen,
    Upload,
    Info,
    Mail,
    Star,
    ShoppingCart,
    HelpCircle,
} from "lucide-react";

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

export default function MobileDrawer({ isOpen, onClose, onLogout }: MobileDrawerProps): JSX.Element {
    const { data: session } = useSession();
    const drawerRef = useRef<HTMLDivElement>(null);

    // Close drawer on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when drawer is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Navigation links with icons
    const navigationLinks = [
        { href: "/", label: "НАЧАЛО", icon: Home },
        { href: "/gallery", label: "ГАЛЕРИЯ", icon: Palette },
        { href: "/artists", label: "АРТИСТИ", icon: Users },
        { href: "/courses", label: "КУРСОВЕ", icon: BookOpen },
        session?.user?.artistProfile
            ? { href: "/upload-artwork", label: "КАЧИ КАРТИНА", icon: Upload }
            : { href: "/become-an-artist", label: "СТАНИ АРТИСТ", icon: Star },
    ];

    const additionalLinks = [
        { href: "/about", label: "ЗА НАС", icon: Info },
        { href: "/contact", label: "КОНТАКТИ", icon: Mail },
        { href: "/faq", label: "ЧЕСТО ЗАДАВАНИ ВЪПРОСИ", icon: HelpCircle },
    ];

    const userLinks = [
        { href: "/my-profile", label: "МОЯТ ПРОФИЛ", icon: User2 },
        { href: "/favorites", label: "ЛЮБИМИ", icon: Heart },
        { href: "/cart", label: "КОШНИЦА", icon: ShoppingCart },
    ];

    if (session?.user?.role === "ADMIN") {
        userLinks.unshift({ href: "/admin", label: "АДМИН ПАНЕЛ", icon: Shield });
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className={`mobile-drawer-backdrop ${isOpen ? 'mobile-drawer-backdrop--open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className={`mobile-drawer ${isOpen ? 'mobile-drawer--open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Мобилно меню"
            >
                {/* Header */}
                <div className="mobile-drawer-header">
                    <div className="mobile-drawer-header-content">
                        <h2 className="mobile-drawer-title">МЕНЮ</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mobile-drawer-close"
                            aria-label="Затвори меню"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="mobile-drawer-content">
                    <nav className="mobile-drawer-nav">
                        {/* Main Navigation */}
                        <div className="mobile-drawer-section">
                            <h3 className="mobile-drawer-section-title">НАВИГАЦИЯ</h3>
                            <ul className="mobile-drawer-list">
                                {navigationLinks.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <li key={link.href} className="mobile-drawer-item">
                                            <NavigationLink
                                                href={link.href}
                                                className="mobile-drawer-link"
                                                onClick={onClose}
                                            >
                                                <Icon size={20} className="mobile-drawer-link-icon" />
                                                <span className="mobile-drawer-link-text">{link.label}</span>
                                            </NavigationLink>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* User Links */}
                        {session && (
                            <div className="mobile-drawer-section">
                                <h3 className="mobile-drawer-section-title">ПРОФИЛ</h3>
                                <ul className="mobile-drawer-list">
                                    {userLinks.map((link) => {
                                        const Icon = link.icon;
                                        return (
                                            <li key={link.href} className="mobile-drawer-item">
                                                <NavigationLink
                                                    href={link.href}
                                                    className="mobile-drawer-link"
                                                    onClick={onClose}
                                                >
                                                    <Icon size={20} className="mobile-drawer-link-icon" />
                                                    <span className="mobile-drawer-link-text">{link.label}</span>
                                                </NavigationLink>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {/* Additional Links */}
                        <div className="mobile-drawer-section">
                            <h3 className="mobile-drawer-section-title">ИНФОРМАЦИЯ</h3>
                            <ul className="mobile-drawer-list">
                                {additionalLinks.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <li key={link.href} className="mobile-drawer-item">
                                            <NavigationLink
                                                href={link.href}
                                                className="mobile-drawer-link"
                                                onClick={onClose}
                                            >
                                                <Icon size={20} className="mobile-drawer-link-icon" />
                                                <span className="mobile-drawer-link-text">{link.label}</span>
                                            </NavigationLink>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Auth Section */}
                        <div className="mobile-drawer-section mobile-drawer-section--auth">
                            {session ? (
                                <button
                                    onClick={() => {
                                        onLogout();
                                        onClose();
                                    }}
                                    className="mobile-drawer-logout"
                                >
                                    <LogOut size={20} className="mobile-drawer-link-icon" />
                                    <span className="mobile-drawer-link-text">ИЗХОД</span>
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    className="mobile-drawer-login"
                                    onClick={onClose}
                                >
                                    <LogIn size={20} className="mobile-drawer-link-icon" />
                                    <span className="mobile-drawer-link-text">ВХОД</span>
                                </Link>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </>
    );
}
