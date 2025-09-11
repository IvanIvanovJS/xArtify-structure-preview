"use client";

import Link from "next/link";
import Image from "next/image";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Search,
    User2,
    Heart,
    ShoppingCart,
    Menu,
    LogIn,
    LogOut,
} from "lucide-react";

// заменя useInstantHideOnScroll в Header.tsx
function getScrollRootSafe(): Window | HTMLElement {
    const main = document.querySelector("main") as HTMLElement | null;
    if (main) {
        const oy = getComputedStyle(main).overflowY;
        const canScroll = main.scrollHeight > main.clientHeight;
        if (canScroll && (oy === "auto" || oy === "scroll")) return main;
    }
    return window;
}

function getScrollTopWin(): number {
    return window.scrollY || window.pageYOffset || 0;
}
function getScrollTopEl(el: HTMLElement | null): number {
    return el ? el.scrollTop : 0;
}

function useInstantHideOnScroll(): { hidden: boolean } {
    const [hidden, setHidden] = useState<boolean>(false);
    const lastY = useRef<number>(0);
    const mainRef = useRef<HTMLElement | null>(null);
    const rafId = useRef<number | null>(null);

    useEffect(() => {
        // guard за SSR
        if (typeof window === "undefined" || typeof document === "undefined") return;

        const maybeMain = getScrollRootSafe();
        mainRef.current = maybeMain instanceof Window ? null : (maybeMain as HTMLElement);

        const readY = (): number =>
            Math.max(getScrollTopWin(), getScrollTopEl(mainRef.current));

        const update = (): void => {
            rafId.current = null;
            const y = readY();
            if (y <= 0) { setHidden(false); lastY.current = 0; return; }
            setHidden(y > lastY.current);      // надолу → скрий; нагоре → покажи
            lastY.current = y;
        };

        const onScroll = (): void => {
            if (rafId.current == null) rafId.current = window.requestAnimationFrame(update);
        };

        // слушаме ВИНАГИ window + ПО ЖЕЛАНИЕ main (ако реално скролва)
        window.addEventListener("scroll", onScroll, { passive: true });
        if (mainRef.current) mainRef.current.addEventListener("scroll", onScroll, { passive: true });

        // първоначален sync
        update();

        return () => {
            window.removeEventListener("scroll", onScroll);
            if (mainRef.current) mainRef.current.removeEventListener("scroll", onScroll);
            if (rafId.current != null) { window.cancelAnimationFrame(rafId.current); rafId.current = null; }
        };
    }, []);

    return { hidden };
}

export default function NavigationHeader(): JSX.Element {
    const { data: session } = useSession();

    // състояния
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [searchOpen, setSearchOpen] = useState<boolean>(false);

    // детекция за мобилен размер в клиент (само за анимации/позиции)
    const [isMobile, setIsMobile] = useState<boolean>(false);
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        const handler = (e: MediaQueryListEvent | MediaQueryList): void =>
            setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);
        handler(mq);
        mq.addEventListener?.("change", handler);
        return () => mq.removeEventListener?.("change", handler);
    }, []);

    const { hidden } = useInstantHideOnScroll();

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
            session?.user
                ? { href: "/upload-artwork", label: "Качи картина" }
                : { href: "/create-artist-profile", label: "Стани артист" },
        ],
        [session]
    );

    // Функция за скролване към началото
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <>
            {/* BAR (shared) */}
            <header
                className={[
                    "x-header will-change-transform fixed top-0 left-0 right-0 transform-gpu",
                    "transition-none", // мигновено, без латентност
                    hidden ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
                ].join(" ")}
                role="banner"
            >
                <div className="x-header__bar max-w-7xl w-full">
                    {/* ЛЯВО */}
                    <div className="flex items-center gap-2">
                        {/* MOBILE: профил/любими/карт вляво + Search иконка на мобилно */}
                        <div className="md:hidden flex items-center gap-1">
                            <Link href={session ? "/profile" : "/login"} aria-label="Моят профил" className="x-icon-btn">
                                <User2 size={22} aria-hidden />
                            </Link>
                            <Link href="/favorites" aria-label="Любими" className="x-icon-btn">
                                <Heart size={22} aria-hidden />
                            </Link>
                            <Link href="/cart" aria-label="Количка" className="x-icon-btn">
                                <ShoppingCart size={22} aria-hidden />
                            </Link>
                            <button
                                type="button"
                                aria-expanded={searchOpen}
                                aria-controls="header-search-mobile"
                                onClick={() => setSearchOpen((s) => !s)}
                                className="x-icon-btn"
                            >
                                <Search size={22} aria-hidden />
                            </button>
                        </div>

                        {/* DESKTOP: Search иконка вляво */}
                        <button
                            type="button"
                            aria-expanded={searchOpen}
                            aria-controls="header-search-desktop"
                            onClick={() => setSearchOpen((s) => !s)}
                            className="hidden md:inline-flex x-icon-btn gap"
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
                            onClick={(e) => {
                                e.preventDefault();
                                setSearchOpen(false);
                                setDrawerOpen(false);
                                scrollToTop();
                            }}
                        >
                            <Image src="/xArtify-logo9.svg" alt="xArtify" width={220} height={60} priority />
                        </Link>
                    </div>
                    {/* ДЯСНО */}
                    <div className="x-header__actions">
                        <div className="hidden md:flex items-center gap-4">
                            <Link href={session ? "/profile" : "/login"} aria-label="Моят профил" className="x-icon-btn">
                                <User2 size={24} aria-hidden />
                            </Link>
                            <Link href="/favorites" aria-label="Любими" className="x-icon-btn">
                                <Heart size={24} aria-hidden />
                            </Link>
                            <Link href="/cart" aria-label="Количка" className="x-icon-btn">
                                <ShoppingCart size={24} aria-hidden />
                            </Link>
                        </div>

                        {/* MOBILE: бургер вдясно */}
                        <button
                            type="button"
                            aria-label="Меню"
                            aria-expanded={drawerOpen}
                            onClick={() => setDrawerOpen((v) => !v)}
                            className="md:hidden x-icon-btn"
                        >
                            <Menu size={22} aria-hidden />
                        </button>
                    </div>
                </div>

                {/* SEARCH POPOVER – overlay, не променя layout */}
                <div
                    id="header-search-popover"
                    aria-hidden={!searchOpen}
                    className={[
                        "x-search-popover",
                        searchOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
                    ].join(" ")}
                >
                    <div className="x-search">
                        <input
                            id={isMobile ? "header-search-mobile" : "header-search-desktop"}
                            type="search"
                            placeholder="Търси в xArtify…"
                            className="x-search__input"
                            autoFocus
                        />
                        <div className="x-search__icon"><Search size={24} aria-hidden /></div>
                    </div>
                </div>

                {/* Под лентата – четирите линка (DESKTOP центрирани) */}
                <nav aria-label="Главна навигация" className="hidden md:block bg-transparent">
                    <div className="x-subnav__inner justify-center">
                        {mainLinks.map((l) => (
                            <Link key={l.href} href={l.href} className="nav-pill">{l.label}</Link>
                        ))}
                    </div>
                </nav>
            </header>

            {/* MOBILE DRAWER */}
            <aside className="x-drawer" data-open={drawerOpen ? "true" : "false"} aria-hidden={!drawerOpen}>
                <nav aria-label="Мобилно меню">
                    <ul className="x-drawer__list">
                        {mainLinks.map((l) => (
                            <li key={l.href}>
                                <Link href={l.href} className="x-drawer__item" onClick={() => setDrawerOpen(false)}>
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                        <li className="pt-2"><Link href="/about" className="x-drawer__item" onClick={() => setDrawerOpen(false)}>За нас</Link></li>
                        <li><Link href="/contact" className="x-drawer__item" onClick={() => setDrawerOpen(false)}>Контакти</Link></li>
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
