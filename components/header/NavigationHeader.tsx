"use client";

import Link from "next/link";
import Image from "next/image";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import CartIcon from "../cart/CartIcon";
import { useSession } from "next-auth/react";
import {
    Search,
    User2,
    Heart,
    Menu,
    LogIn,
    LogOut,
    Shield,
} from "lucide-react";

// Опростена логика за скролване на хедъра
function useHeaderScroll(): { hidden: boolean; showOnHover: () => void; hideOnLeave: () => void } {
    const [hidden, setHidden] = useState<boolean>(false);
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const lastScrollY = useRef<number>(0);
    const ticking = useRef<boolean>(false);

    useEffect(() => {
        // guard за SSR
        if (typeof window === "undefined") return;

        const updateHeader = () => {
            if (ticking.current) return;

            ticking.current = true;
            requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;

                // Ако сме в началото на страницата, винаги показваме хедъра
                if (currentScrollY <= 10) {
                    setHidden(false);
                    lastScrollY.current = currentScrollY;
                    ticking.current = false;
                    return;
                }

                // Ако hover-ваме в горната част, показваме хедъра
                if (isHovering) {
                    setHidden(false);
                    lastScrollY.current = currentScrollY;
                    ticking.current = false;
                    return;
                }

                // Ако скролваме надолу и сме над 100px от началото - скриваме
                if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
                    setHidden(true);
                }
                // Ако скролваме нагоре - показваме
                else if (currentScrollY < lastScrollY.current) {
                    setHidden(false);
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
        };
    }, [isHovering, hidden]);

    const showOnHover = () => setIsHovering(true);
    const hideOnLeave = () => setIsHovering(false);

    return { hidden, showOnHover, hideOnLeave };
}

export default function NavigationHeader(): JSX.Element {
    const { data: session } = useSession();

    // състояния
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [searchOpen, setSearchOpen] = useState<boolean>(false);
    const [isMounted, setIsMounted] = useState<boolean>(false);

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

    const { hidden, showOnHover, hideOnLeave } = useHeaderScroll();

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
                : { href: "/create-artist-profile", label: "Стани артист" },
        ],
        [session]
    );

    // Функция за скролване към началото
    const scrollToTop = () => {
        // Затваряме всички отворени менюта
        setSearchOpen(false);
        setDrawerOpen(false);

        // Скролваме към началото
        document.querySelector('body')?.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

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
                ].join(" ")}
                role="banner"
                onMouseEnter={isMounted ? showOnHover : undefined}
                onMouseLeave={isMounted ? hideOnLeave : undefined}
            >
                <div className="x-header__bar">
                    {/* ЛЯВО */}
                    <div className="flex items-center gap-2">
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
                            <Link
                                href={session ? "/profile" : "/login"}
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
                            <Image src="/xArtify-logo9.svg" alt="xArtify" width={220} height={60} priority />
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

                            <Link
                                href={session ? "/profile" : "/login"}
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
                <nav aria-label="Главна навигация" className="hidden md:block bg-transparent mt-1">
                    <div className="x-subnav__inner justify-center">
                        {mainLinks.map((l) => (
                            <Link key={l.href} href={l.href} className="nav-pill">{l.label}</Link>
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
                        <div className="x-search__icon"><Search size={24} aria-hidden /></div>
                    </div>
                </div>
            </header>

            {/* MOBILE DRAWER */}
            <aside className="x-drawer" data-open={drawerOpen ? "true" : "false"} aria-hidden={!drawerOpen}>
                <nav aria-label="Мобилно меню">
                    <ul className="x-drawer__list">
                        {mainLinks.map((l) => (
                            <li key={l.href}>
                                <Link href={l.href} className="x-drawer__item " onClick={() => setDrawerOpen(false)}>
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                        <li className="pt-2"><Link href="/about" className="x-drawer__item " onClick={() => setDrawerOpen(false)}>За нас</Link></li>
                        <li><Link href="/contact" className="x-drawer__item" onClick={() => setDrawerOpen(false)}>Контакти</Link></li>

                        {/* Admin Panel Link - само за admin потребители */}
                        {session?.user?.role === "ADMIN" && (
                            <li className="pt-2">
                                <Link href="/admin" className="x-drawer__item" onClick={() => setDrawerOpen(false)}>
                                    <span className="inline-flex items-center gap-2">
                                        <Shield size={18} /> Admin Panel
                                    </span>
                                </Link>
                            </li>
                        )}

                        <li className="pt-2">
                            {session ? (
                                <Link href="/api/auth/signout" className="x-drawer__item"><span className="inline-flex items-center gap-2"><LogOut size={18} /> Изход</span></Link>
                            ) : (
                                <Link href="/login" className="x-drawer__item"><span className="inline-flex items-center gap-2"><LogIn size={18} /> Вход</span></Link>
                            )}
                        </li>
                    </ul>
                </nav>
            </aside>
            <button
                type="button"
                className="x-drawer__backdrop"
                data-open={drawerOpen ? "true" : "false"}
                aria-hidden={!drawerOpen}
                onClick={() => setDrawerOpen(false)}
            />
        </>
    );
}
