// File: app/components/Header.tsx
"use client";

import type { FC, ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, X, User2, Heart, Search as SearchIcon } from "lucide-react";
import CartIcon from "@/components/CartIcon";

interface SessionUser {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    artistProfile?: object | null;
}

const Header: FC = (): ReactElement => {
    const { data: session } = useSession();
    const pathname = usePathname();

    const isAuthenticated: boolean = Boolean(session?.user);
    const isArtist: boolean = Boolean((session?.user as SessionUser | undefined)?.artistProfile);
    console.log("test");

    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
    const [mounted, setMounted] = useState<boolean>(false);

    const profileBtnRef = useRef<HTMLButtonElement | null>(null);
    const profileMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => { setMounted(true); }, []);

    // Close menus when route changes
    useEffect(() => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
    }, [pathname]);

    // Click/tap outside + ESC to close profile menu (robust for mobile)
    useEffect(() => {
        function onDocPointerDown(e: Event): void {
            const target = e.target as Node | null;
            if (
                isProfileOpen &&
                profileMenuRef.current &&
                profileBtnRef.current &&
                target &&
                !profileMenuRef.current.contains(target) &&
                !profileBtnRef.current.contains(target)
            ) {
                setIsProfileOpen(false);
            }
        }
        function onEsc(ev: KeyboardEvent): void {
            if (ev.key === "Escape") {
                setIsMenuOpen(false);
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("pointerdown", onDocPointerDown);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("pointerdown", onDocPointerDown);
            document.removeEventListener("keydown", onEsc);
        };
    }, [isProfileOpen]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        const el = document.documentElement;
        if (isMenuOpen) el.classList.add("overflow-hidden");
        else el.classList.remove("overflow-hidden");
        return () => el.classList.remove("overflow-hidden");
    }, [isMenuOpen]);

    const drawerItems: Array<{ href: string; label: string; show: boolean }> = [
        { href: "/courses", label: "Курсове", show: true },
        { href: "/gallery", label: "Галерия", show: true },
        { href: "/artists", label: "Артисти", show: true },
        { href: "/create-artist-profile", label: "Стани артист", show: !isArtist },
        { href: "/upload-artwork", label: "Качване на картина", show: isArtist },
        { href: "/about", label: "За нас", show: true },
        { href: "/contacts", label: "Контакти", show: true },
        { href: "/login", label: "Вход", show: !isAuthenticated },
    ];

    const subnavItems: Array<{ href: string; label: string; show: boolean }> = [
        { href: "/courses", label: "Курсове", show: true },
        { href: "/gallery", label: "Галерия", show: true },
        { href: "/artists", label: "Артисти", show: true },
        { href: "/create-artist-profile", label: "Стани артист", show: !isArtist },
        { href: "/upload-artwork", label: "Качи картина", show: isArtist },
        { href: "/about", label: "За нас", show: true },
        { href: "/contacts", label: "Контакти", show: true },
        { href: "/login", label: "Вход", show: !isAuthenticated },
    ];

    const handleSignOut = async (): Promise<void> => {
        await signOut({ callbackUrl: "/login" });
    };

    return (
        <header className="x-header" role="banner">
            <div className="x-header__bar" aria-label="Основна лента">
                {/* LEFT: burger (mobile) + desktop logo */}
                <div className="x-header__burger">
                    <button
                        type="button"
                        className="x-header__burger-btn md:hidden"
                        aria-label={isMenuOpen ? "Затвори меню" : "Отвори меню"}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-drawer"
                        onClick={() => setIsMenuOpen((v) => !v)}
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <Link href="/" className="hidden md:inline-flex items-center" aria-label="Xartify – начало">
                        <Image src="/xArtify-logo7.png" alt="Xartify" width={300} height={70} priority />
                    </Link>
                </div>

                {/* CENTER: mobile logo / desktop search */}
                <div className="justify-self-center w-full max-w-xl">
                    <Link href="/" className="x-header__logo md:hidden" aria-label="Xartify – начало">
                        <Image src="/xArtify-logo7.png" alt="Xartify" width={300} height={20} priority />
                    </Link>
                    <div className="hidden md:block">
                        <form className="x-search" action="/search" method="get" role="search">
                            <input className="x-search__input" type="search" name="q" placeholder="Търсене..." autoComplete="off" aria-label="Поле за търсене" />
                            <button className="x-search__icon" aria-label="Търси" type="submit">
                                <SearchIcon size={18} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT: actions */}
                <div className="x-header__actions">
                    <div className="relative">
                        <button
                            ref={profileBtnRef}
                            type="button"
                            className="x-icon-btn"
                            aria-label="Профил"
                            aria-haspopup="menu"
                            aria-expanded={isProfileOpen}
                            aria-controls="profile-menu"
                            onClick={() => setIsProfileOpen((v) => !v)}
                        >
                            <User2 size={18} />
                        </button>

                        <div
                            id="profile-menu"
                            ref={profileMenuRef}
                            className="x-profile-menu"
                            data-open={isProfileOpen ? "true" : "false"}
                            role="menu"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            {isAuthenticated ? (
                                <div>
                                    <Link href="/my-profile" className="x-profile-menu__item" role="menuitem">Моят профил</Link>
                                    <Link href="/my-courses" className="x-profile-menu__item" role="menuitem">Моите курсове</Link>
                                    {!isArtist && <Link href="/create-artist-profile" className="x-profile-menu__item" role="menuitem">Стани артист</Link>}
                                    {isArtist && <Link href="/upload-artwork" className="x-profile-menu__item" role="menuitem">Качване на картина</Link>}
                                    <Link href="/change-password" className="x-profile-menu__item" role="menuitem">Смяна на парола</Link>
                                    <button onClick={handleSignOut} className="x-profile-menu__item x-profile-menu__item--danger" role="menuitem">Изход</button>
                                </div>
                            ) : (
                                <div>
                                    <Link href="/login" className="x-profile-menu__item" role="menuitem">Вход</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <Link href="/favorite-artists" aria-label="Любими" className="x-icon-btn">
                        <Heart size={18} />
                    </Link>

                    {/* IMPORTANT: do not wrap CartIcon with <Link> (it already links) */}
                    <div className="x-icon-btn" aria-label="Количка">
                        <CartIcon />
                    </div>
                </div>
            </div>

            {/* MOBILE search */}
            <div className="x-header__search md:hidden" role="search">
                <form className="x-search" action="/search" method="get">
                    <input className="x-search__input" type="search" name="q" placeholder="Търсене..." autoComplete="off" aria-label="Поле за търсене" />
                    <button className="x-search__icon" aria-label="Търси" type="submit">
                        <SearchIcon size={18} />
                    </button>
                </form>
            </div>

            {/* SUBNAV */}
            <div className="x-subnav " role="navigation" aria-label="Главна навигация">
                <div className="x-subnav__inner no-scrollbar">
                    {subnavItems.filter((i) => i.show).map((item) => (
                        <Link key={item.href} href={item.href} className="x-subnav__link">{item.label}</Link>
                    ))}
                </div>
            </div>

            {/* DRAWER */}
            {mounted && createPortal(
                <>
                    <aside
                        id="mobile-drawer"
                        className="x-drawer"
                        data-open={isMenuOpen ? "true" : "false"}
                        aria-hidden={!isMenuOpen}
                    >
                        <nav className="x-drawer__list" aria-label="Мобилно меню">
                            {drawerItems.filter(i => i.show).map(item => (
                                <Link key={item.href} href={item.href} className="x-drawer__item" onClick={() => setIsMenuOpen(false)}>
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </aside>
                    <div
                        className="x-drawer__backdrop"
                        data-open={isMenuOpen ? "true" : "false"}
                        aria-hidden={!isMenuOpen}
                        onClick={() => setIsMenuOpen(false)}
                    />
                </>,
                document.body
            )}
        </header>
    );
};

export default Header;


