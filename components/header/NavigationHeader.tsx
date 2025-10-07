"use client";

import Link from "next/link";
import Image from "next/image";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import CartIcon from "../cart/CartIcon";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import LogoutConfirmation from "../ui/LogoutConfirmation";
import NavigationLink from "../ui/interSplashScreen/NavigationLink";
import MobileDrawer from "./MobileDrawer";
import ProfileDropdown from "./ProfileDropdown";
import "./styles/mobile-drawer.css";
import {
    Search,
    User2,
    Heart,
    Menu,
    Shield,
} from "lucide-react";

// Опростена логика за скролване на хедъра
function useHeaderScroll(): { hidden: boolean; showOnHover: () => void; hideOnLeave: () => void; hasScrolled: boolean } {
    const [hidden, setHidden] = useState<boolean>(false);
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const [hasScrolled, setHasScrolled] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const lastScrollY = useRef<number>(0);
    const ticking = useRef<boolean>(false);

    useEffect(() => {
        // guard за SSR
        if (typeof window === "undefined") return;

        // Детекция за мобилни устройства
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 767);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        const updateHeader = () => {
            if (ticking.current) return;

            ticking.current = true;
            requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;

                // Ако сме в началото на страницата, винаги показваме хедъра
                if (currentScrollY <= 10) {
                    setHidden(false);
                    setHasScrolled(false);
                    lastScrollY.current = currentScrollY;
                    ticking.current = false;
                    return;
                }

                // Отбелязваме че сме скролвали над 10px
                if (currentScrollY > 10) {
                    setHasScrolled(true);
                }

                // РАЗЛИЧНА ЛОГИКА ЗА МОБИЛНИ И ДЕСКТОП
                if (isMobile) {
                    // МОБИЛНА ЛОГИКА - по-агресивно скриване/показване
                    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                        // Скриваме при скролване надолу над 50px
                        setHidden(true);
                    } else if (currentScrollY < lastScrollY.current && currentScrollY > 50) {
                        // Показваме при скролване нагоре над 50px
                        setHidden(false);
                    } else if (currentScrollY <= 50) {
                        // Винаги показваме под 50px
                        setHidden(false);
                    }
                } else {
                    // ДЕСКТОП ЛОГИКА - с hover функционалност
                    if (isHovering) {
                        setHidden(false);
                        lastScrollY.current = currentScrollY;
                        ticking.current = false;
                        return;
                    }

                    // Ако скролваме надолу и сме над 100px от началото - скриваме
                    if (currentScrollY > lastScrollY.current && currentScrollY > 56) {
                        setHidden(true);
                    }
                    // Ако скролваме нагоре и сме над 100px - показваме само ако сме скролвали достатъчно нагоре
                    else if (currentScrollY < lastScrollY.current && currentScrollY > 100 && (lastScrollY.current - currentScrollY) > 50) {
                        setHidden(false);
                    }
                    // Ако сме между 10px и 100px - винаги показваме хедъра
                    else if (currentScrollY <= 56) {
                        setHidden(false);
                    }
                }

                lastScrollY.current = currentScrollY;
                ticking.current = false;
            });
        };

        window.addEventListener("scroll", updateHeader, { passive: true });

        // Първоначална проверка
        updateHeader();


        return () => {
            window.removeEventListener("scroll", updateHeader);
            window.removeEventListener('resize', checkMobile);
        };
    }, [isHovering, hidden, isMobile]);

    const showOnHover = () => setIsHovering(true);
    const hideOnLeave = () => setIsHovering(false);

    return { hidden, showOnHover, hideOnLeave, hasScrolled };
}

export default function NavigationHeader(): JSX.Element {
    const { data: session } = useSession();
    const pathname = usePathname();

    // състояния
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [searchOpen, setSearchOpen] = useState<boolean>(false);
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
    const profileDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Скриваме хедъра на login, register и forgotten-password страниците
    const shouldHideHeader = pathname === "/login" || pathname === "/register" || pathname === "/forgotten-password";

    // детекция за мобилен размер в клиент (само за анимации/позиции)
    const [isMobile, setIsMobile] = useState<boolean>(false);

    // Mount guard за да избегнем hydration mismatch
    useEffect(() => {
        setIsMounted(true);
        const mq = window.matchMedia("(max-width: 767px)");
        const handler = (e: MediaQueryListEvent | MediaQueryList): void =>
            setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);
        handler(mq);
        mq.addEventListener?.("change", handler);
        return () => mq.removeEventListener?.("change", handler);
    }, []);

    const { hidden, showOnHover, hideOnLeave, hasScrolled } = useHeaderScroll();

    // Затваряне на search при клик извън
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            const searchPopover = document.getElementById('header-search-popover');
            const searchButton = target.closest('button[aria-controls*="header-search"]');

            if (searchOpen && searchPopover && !searchPopover.contains(target) && !searchButton) {
                setSearchOpen(false);
            }
        };

        if (searchOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchOpen]);

    // Затваряне на profile dropdown при клик извън
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            const profileButton = target.closest('button[aria-controls*="profile-dropdown"]');
            const profileDropdown = target.closest('.profile-dropdown');

            if (profileDropdownOpen && !profileButton && !profileDropdown) {
                setProfileDropdownOpen(false);
            }
        };

        if (profileDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileDropdownOpen]);

    // Управление на фокуса при отваряне/затваряне на search
    useEffect(() => {
        if (searchOpen) {
            // Фокус върху input полето когато се отваря
            const input = document.getElementById(isMounted && isMobile ? "header-search-mobile" : "header-search-desktop");
            if (input) {
                input.focus();
            }
        }
    }, [searchOpen, isMounted, isMobile]);

    // Touch feedback за мобилни устройства
    const handleTouchStart = (e: React.TouchEvent) => {
        const target = e.currentTarget as HTMLElement;
        target.classList.add('x-icon-btn--touching');
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const target = e.currentTarget as HTMLElement;
        target.classList.remove('x-icon-btn--touching');
    };

    // Затваряне на search при Escape
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && searchOpen) {
                setSearchOpen(false);
            }
        };

        if (searchOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [searchOpen]);

    // навигационните линкове
    const mainLinks = useMemo(
        () => [
            { href: "/courses", label: "Курсове" },
            { href: "/gallery", label: "Галерия" },
            { href: "/artists", label: "Артисти" },
            session?.user?.artistProfile
                ? { href: "/upload-artwork", label: "Качи картина" }
                : { href: "/become-an-artist/plans", label: "Стани артист" },
        ],
        [session]
    );

    // Функция за скролване към началото
    const scrollToTop = () => {
        // Затваряме всички отворени менюта
        setSearchOpen(false);
        setDrawerOpen(false);
        setProfileDropdownOpen(false);

        // Скролваме към началото
        document.querySelector('body')?.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (profileDropdownTimeoutRef.current) {
                clearTimeout(profileDropdownTimeoutRef.current);
            }
        };
    }, []);

    // Ако трябва да скрием хедъра, не рендираме нищо
    if (shouldHideHeader) {
        return <></>;
    }

    return (
        <>
            {/* Hover зона за показване на хедъра - само на клиент */}
            {isMounted && (
                <div
                    className="fixed top-0 left-0 right-0 h-4 z-[60]"
                    onMouseEnter={showOnHover}
                    onMouseLeave={hideOnLeave}
                    aria-hidden="true"
                />
            )}

            {/* BAR (shared) */}
            <header
                className={[
                    "x-header",
                    hidden ? "-translate-y-full" : "translate-y-0",
                    // Добавяме фон когато сме скролвали (и на десктоп и на мобилни)
                    isMounted && hasScrolled ? "x-header--scrolled" : "",
                ].join(" ")}
                role="banner"
                onMouseEnter={isMounted ? showOnHover : undefined}
                onMouseLeave={isMounted ? hideOnLeave : undefined}
            >
                <div className="x-header__bar">
                    {/* ЛЯВО */}
                    <div className="flex items-center md:gap-2 gap-1">
                        {/* MOBILE: профил/любими/карт вляво + Search иконка на мобилно */}
                        <div className="md:hidden flex items-center gap-1">
                            <button
                                type="button"
                                aria-expanded={searchOpen}
                                aria-controls="header-search-mobile"
                                onClick={() => setSearchOpen((s) => !s)}
                                className="x-icon-btn"
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            >
                                <Search size={22} aria-hidden />
                            </button>
                            {/* Admin Panel Link - само за admin потребители */}
                            {session?.user?.role === "ADMIN" && (
                                <Link href="/admin" className="x-icon-btn" title="Admin Panel"
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={handleTouchEnd}>
                                    <Shield size={18} aria-hidden />
                                </Link>
                            )}
                            <Link
                                href={session ? "/my-profile" : "/login"}
                                aria-label="Моят профил"
                                className="x-icon-btn"
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            >
                                <User2 size={24} aria-hidden />
                            </Link>
                            <Link
                                href="/favorites"
                                aria-label="Любими"
                                className="x-icon-btn"
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            >
                                <Heart size={24} aria-hidden />
                            </Link>

                            <CartIcon />

                        </div>

                        {/* DESKTOP: Search иконка вляво */}
                        <button
                            type="button"
                            aria-expanded={searchOpen}
                            aria-controls="header-search-desktop"
                            onClick={() => setSearchOpen((s) => !s)}
                            className="hidden md:inline-flex x-icon-btn gap"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            <Search size={24} aria-hidden />
                        </button>
                    </div>

                    {/* ЦЕНТЪР: Лого */}
                    <div className="x-header__logo">
                        <Link
                            href="/"
                            aria-label="xArtify – начало"
                            className="inline-block"
                            onClick={scrollToTop}
                        >
                            <Image
                                src="/xArtify-logo13.svg"
                                alt="xArtify"
                                width={140}
                                height={54}
                                className="w-[100px] h-[36px] md:w-[140px] md:h-[54px]"
                                priority
                            />
                        </Link>
                    </div>
                    {/* ДЯСНО */}
                    <div className="x-header__actions">
                        <div className="hidden md:flex items-center gap-4">
                            {/* Admin Panel Link - само за admin потребители */}
                            {session?.user?.role === "ADMIN" && (
                                <Link
                                    href="/admin"
                                    aria-label="Admin Panel"
                                    className="x-icon-btn"
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={handleTouchEnd}
                                    title="Admin Panel"
                                >
                                    <Shield size={24} aria-hidden />
                                </Link>
                            )}

                            {session ? (
                                <div
                                    className="relative"
                                    onMouseEnter={() => {
                                        if (profileDropdownTimeoutRef.current) {
                                            clearTimeout(profileDropdownTimeoutRef.current);
                                            profileDropdownTimeoutRef.current = null;
                                        }
                                        setProfileDropdownOpen(true);
                                    }}
                                    onMouseLeave={() => {
                                        profileDropdownTimeoutRef.current = setTimeout(() => {
                                            setProfileDropdownOpen(false);
                                        }, 300);
                                    }}
                                >
                                    <Link
                                        href="/my-profile"
                                        aria-label="Моят профил"
                                        className="x-icon-btn"
                                        title="Моят профил"
                                        onTouchStart={handleTouchStart}
                                        onTouchEnd={handleTouchEnd}
                                    >
                                        <User2 size={24} aria-hidden />
                                    </Link>
                                    <ProfileDropdown
                                        isOpen={profileDropdownOpen}
                                        onClose={() => setProfileDropdownOpen(false)}
                                        onLogout={() => setShowLogoutConfirm(true)}
                                    />
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    aria-label="Вход"
                                    className="x-icon-btn"
                                    title="Вход"
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    <User2 size={24} aria-hidden />
                                </Link>
                            )}
                            <Link
                                href="/favorites-artists"
                                aria-label="Любими артисти"
                                className="x-icon-btn"
                                title="Любими артисти"
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            >
                                <Heart size={24} aria-hidden />
                            </Link>


                            <CartIcon />

                        </div>

                        {/* MOBILE: бургер вдясно */}
                        <button
                            type="button"
                            aria-label="Меню"
                            aria-expanded={drawerOpen}
                            onClick={() => setDrawerOpen((v) => !v)}
                            className="md:hidden x-icon-btn"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            <Menu size={22} aria-hidden />
                        </button>
                    </div>
                </div>

                {/* Под лентата – четирите линка (DESKTOP центрирани) */}
                <nav aria-label="Главна навигация" className="hidden md:block bg-transparent">
                    <div className="x-subnav__inner justify-center">
                        {mainLinks.map((l) => (
                            <NavigationLink key={l.href} href={l.href} className="nav-pill">{l.label}</NavigationLink>
                        ))}
                    </div>
                </nav>
                {/* SEARCH POPOVER – overlay, не променя layout */}
                <div
                    id="header-search-popover"
                    aria-hidden={!searchOpen}
                    inert={!searchOpen ? true : undefined}
                    className={[

                        searchOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
                    ].join(" ")}
                    style={{ display: searchOpen ? 'block' : 'none' }}
                >
                    <div className="x-search">
                        <input
                            id={isMounted && isMobile ? "header-search-mobile" : "header-search-desktop"}
                            type="search"
                            placeholder="Търси в xArtify…"
                            className="x-search__input"
                            autoFocus={searchOpen}
                            tabIndex={searchOpen ? 0 : -1}
                        />
                        <div className="x-search__icon" title="Търсене"><Search size={24} aria-hidden /></div>
                    </div>
                </div>
            </header >

            {/* MOBILE DRAWER */}
            <MobileDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onLogout={() => setShowLogoutConfirm(true)}
            />

            {/* Logout Confirmation Modal */}
            <LogoutConfirmation
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
            />
        </>
    );
}
