"use client";

import { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProfileCard from "./ProfileCard";
import LogoutConfirmation from "../ui/LogoutConfirmation";
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
    Star
} from "lucide-react";
import "./styles/my-profile.css";
import { JSX } from "react";

interface UserData {
    id: string;
    name: string | null;
    image: string | null;
    isArtist: boolean;
    artistProfile: {
        bio: string | null;
        phoneNumber: string | null;
    } | null;
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

export default function MyProfileClient(): JSX.Element {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

    const router = useRouter();

    const fetchProfileData = useCallback(async () => {
        try {
            const response = await fetch("/api/profile");

            if (response.status === 401) {
                setErrorMessage("Сесията ви е изтекла. Ще бъдете пренасочени към страницата за влизане.");
                setTimeout(() => router.push("/login"), 5000);
                return;
            }

            if (!response.ok) {
                setErrorMessage("Неуспешно зареждане на данни.");
                return;
            }

            const data: UserData = await response.json();
            setUserData(data);
        } catch (err) {
            console.error(err);
            setErrorMessage("Възникна неочаквана грешка при зареждане на профила.");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const profileMenuItems: ProfileMenuItem[] = [
        {
            id: "become-artist",
            title: "Стани артист",
            icon: Star,
            href: "/create-artist-profile",
            description: "Създай артистичен профил",
            isSpecial: true
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

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>Зареждане на профила...</p>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="profile-error">
                <p>{errorMessage || "Неуспешно зареждане на профила."}</p>
            </div>
        );
    }

    const profileImage = userData.image || "/default-avatar.svg";
    const userGroup = userData.isArtist ? "Артист" : "Потребител";
    const displayName = userData.name || "Анонимен потребител";

    // Filter menu items based on user type
    const availableMenuItems = profileMenuItems.filter(item => {
        // Show artist-only items only for artists
        if (item.isArtistOnly && !userData.isArtist) {
            return false;
        }
        return true;
    });

    // Separate "Become Artist" from other items
    const becomeArtistItem = availableMenuItems.find(item => item.id === "become-artist");
    const otherMenuItems = availableMenuItems.filter(item => item.id !== "become-artist");

    return (
        <div className="my-profile-container">
            {errorMessage && (
                <div className="error-message">
                    {errorMessage}
                </div>
            )}

            <div className="profile-header">
                <div className="profile-avatar">
                    <Image
                        src={profileImage}
                        alt="Profile Picture"
                        width={80}
                        height={80}
                        className="avatar-image"
                    />
                </div>
                <div className="profile-info">
                    <h1 className="profile-title">Моят профил</h1>
                    <p className="profile-greeting">Здравей, {displayName}!</p>
                    <span className="user-group">Група: {userGroup}</span>
                </div>
            </div>

            {/* Become Artist Section - Only for non-artists */}
            {!userData.isArtist && becomeArtistItem && (
                <div className="become-artist-section">
                    <ProfileCard
                        key={becomeArtistItem.id}
                        title={becomeArtistItem.title}
                        icon={becomeArtistItem.icon}
                        href={becomeArtistItem.href}
                        description={becomeArtistItem.description}
                        isSpecial={becomeArtistItem.isSpecial}
                    />
                </div>
            )}

            <div className="profile-menu">
                {otherMenuItems.map((item) => {
                    if (item.id === "logout") {
                        return (
                            <div
                                key={item.id}
                                className="profile-card profile-card--logout"
                                onClick={() => setShowLogoutConfirm(true)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        setShowLogoutConfirm(true);
                                    }
                                }}
                                aria-label={`${item.title} - ${item.description}`}
                            >
                                <div className="profile-card__content">
                                    <div className="profile-card__icon">
                                        <item.icon size={24} className="profile-card__icon-svg" aria-hidden="true" />
                                    </div>
                                    <div className="profile-card__text">
                                        <h3 className="profile-card__title">{item.title}</h3>
                                        {item.description && (
                                            <p className="profile-card__description">{item.description}</p>
                                        )}
                                    </div>
                                    <div className="profile-card__arrow">
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="arrow-icon"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M9 18L15 12L9 6"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <ProfileCard
                            key={item.id}
                            title={item.title}
                            icon={item.icon}
                            href={item.href}
                            description={item.description}
                            isSpecial={item.isSpecial}
                        />
                    );
                })}
            </div>

            {/* Logout Confirmation Modal */}
            <LogoutConfirmation
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
            />
        </div>
    );
}
