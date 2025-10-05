"use client";

import { JSX, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
    LogOut,
    Star,
    User2
} from "lucide-react";
import "./styles/profile-dropdown.css";

interface ProfileDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

interface ProfileMenuItem {
    id: string;
    title: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    href: string;
    description?: string;
    isArtistOnly?: boolean;
    isSpecial?: boolean;
}

export default function ProfileDropdown({ isOpen, onClose, onLogout }: ProfileDropdownProps): JSX.Element {
    const { data: session } = useSession();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const profileMenuItems: ProfileMenuItem[] = [
        {
            id: "my-profile",
            title: "Моя профил",
            icon: User2,
            href: "/my-profile",
            description: "Управление на профила"
        },
        {
            id: "become-artist",
            title: "Стани артист",
            icon: Star,
            href: "/become-an-artist",
            description: "Създай артистичен профил",
            isSpecial: true
        },
        {
            id: "add-artwork",
            title: "Добави картина",
            icon: ImageIcon,
            href: "/upload-artwork",
            description: "Качи ново произведение",
            isSpecial: true,
            isArtistOnly: true
        },
        {
            id: "settings",
            title: "Настройки",
            icon: Settings,
            href: "/my-profile/settings",
            description: "Управление на профила"
        },
        {
            id: "orders",
            title: "Моите поръчки",
            icon: ShoppingBag,
            href: "/my-profile/orders",
            description: "История на поръчките"
        },
        {
            id: "favorites",
            title: "Любими произведения",
            icon: Heart,
            href: "/my-profile/favorites",
            description: "Запазени произведения"
        },
        {
            id: "courses",
            title: "Моите курсове",
            icon: BookOpen,
            href: "/my-profile/courses",
            description: "Закупени курсове"
        },
        {
            id: "wallet",
            title: "Портфейл",
            icon: CreditCard,
            href: "/my-profile/wallet",
            description: "Плащания и баланс"
        },
        {
            id: "notifications",
            title: "Известия",
            icon: Bell,
            href: "/my-profile/notifications",
            description: "Настройки за известия"
        },
        {
            id: "artist-profile",
            title: "Профил на артист",
            icon: Palette,
            href: "/my-profile/artist",
            description: "Управление на артистичен профил",
            isArtistOnly: true
        },
        {
            id: "my-artworks",
            title: "Моите произведения",
            icon: ImageIcon,
            href: "/my-profile/artworks",
            description: "Управление на произведения",
            isArtistOnly: true
        },
        {
            id: "analytics",
            title: "Аналитика",
            icon: BarChart3,
            href: "/my-profile/analytics",
            description: "Статистики и отчети",
            isArtistOnly: true
        },
        {
            id: "logout",
            title: "Изход",
            icon: LogOut,
            href: "#",
            description: "Излизане от профила"
        }
    ];


    // Filter menu items based on user type
    const availableMenuItems = profileMenuItems.filter(item => {
        const hasArtistProfile = !!session?.user?.artistProfile;

        // Show "Become Artist" only for non-artists
        if (item.id === "become-artist" && hasArtistProfile) {
            return false;
        }
        // Show "Add Artwork" only for artists
        if (item.id === "add-artwork" && !hasArtistProfile) {
            return false;
        }
        // Show artist-only items only for artists
        if (item.isArtistOnly && !hasArtistProfile) {
            return false;
        }
        return true;
    });

    // Position dropdown to stay in viewport
    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const dropdown = dropdownRef.current;
            const rect = dropdown.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // Check if dropdown goes below viewport
            if (rect.bottom > viewportHeight) {
                dropdown.style.top = 'auto';
                dropdown.style.bottom = '100%';
                dropdown.style.marginTop = '0';
                dropdown.style.marginBottom = '0.5rem';
            }

            // Check if dropdown goes to the right of viewport
            if (rect.right > viewportWidth) {
                dropdown.style.right = '0';
                dropdown.style.left = 'auto';
            }
        }
    }, [isOpen]);

    // Close dropdown on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, []);

    if (!isOpen) return <></>;

    return (
        <>
            <div
                className="profile-dropdown"
                ref={dropdownRef}
                onMouseEnter={() => {
                    if (hideTimeoutRef.current) {
                        clearTimeout(hideTimeoutRef.current);
                        hideTimeoutRef.current = null;
                    }
                }}
                onMouseLeave={() => {
                    hideTimeoutRef.current = setTimeout(() => {
                        onClose();
                    }, 150);
                }}
            >
                <div className="profile-dropdown__content" ref={contentRef}>
                    {availableMenuItems.map((item) => {
                        if (item.id === "logout") {
                            return (
                                <div
                                    key={item.id}
                                    className="profile-dropdown__item profile-dropdown__item--logout"
                                    onClick={() => {
                                        onLogout();
                                        onClose();
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            onLogout();
                                            onClose();
                                        }
                                    }}
                                    aria-label={`${item.title} - ${item.description}`}
                                >
                                    <div className="profile-dropdown__item-content">
                                        <div className="profile-dropdown__item-icon">
                                            <item.icon size={18} className="profile-dropdown__item-icon-svg" />
                                        </div>
                                        <div className="profile-dropdown__item-text">
                                            <span className="profile-dropdown__item-title">{item.title}</span>
                                            {item.description && (
                                                <span className="profile-dropdown__item-description">{item.description}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`profile-dropdown__item ${item.isSpecial ? 'profile-dropdown__item--special' : ''}`}
                                onClick={onClose}
                            >
                                <div className="profile-dropdown__item-content">
                                    <div className="profile-dropdown__item-icon">
                                        <item.icon size={18} className="profile-dropdown__item-icon-svg" />
                                    </div>
                                    <div className="profile-dropdown__item-text">
                                        <span className="profile-dropdown__item-title">{item.title}</span>
                                        {item.description && (
                                            <span className="profile-dropdown__item-description">{item.description}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

        </>
    );
}
