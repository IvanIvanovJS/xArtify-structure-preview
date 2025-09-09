"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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

function getScrollRoot(): Window | HTMLElement {
    const main = document.querySelector("main");
    if (main instanceof HTMLElement) {
        const oy = window.getComputedStyle(main).overflowY;
        if (oy === "auto" || oy === "scroll") return main;
    }
    return window;
}

function readScrollTop(target: Window | HTMLElement): number {
    return target instanceof Window
        ? (target.scrollY || window.pageYOffset)
        : target.scrollTop;
}

function useInstantHideOnScroll(): { hidden: boolean } {
    const [hidden, setHidden] = useState<boolean>(false);
    const lastY = useRef<number>(0);
    const scrollerRef = useRef<Window | HTMLElement | null>(null);
    const ticking = useRef<boolean>(false);

    useEffect(() => {
        scrollerRef.current = getScrollRoot();

        const update = (): void => {
            ticking.current = false;
            const y = readScrollTop(scrollerRef.current ?? window);
            if (y <= 0) { setHidden(false); lastY.current = 0; return; }
            setHidden(y > lastY.current);     // надолу → скрий; нагоре → покажи
            lastY.current = y;
        };

        const onScroll = (): void => {
            if (!ticking.current) { ticking.current = true; requestAnimationFrame(update); }
        };

        const el = scrollerRef.current ?? window;
        (el as Window).addEventListener?.("scroll", onScroll, { passive: true });
        (el as HTMLElement).addEventListener?.("scroll", onScroll, { passive: true } as AddEventListenerOptions);

        return () => {
            (el as Window).removeEventListener?.("scroll", onScroll);
            (el as HTMLElement).removeEventListener?.("scroll", onScroll);
        };
    }, []);

    return { hidden };
}

export default function Header(): JSX.Element {
    const pathname = usePathname();
    const isHome = pathname === "/" || pathname === "/home";
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

    // навигационните линкове
    const mainLinks = useMemo(
        () => [
            { href: "/courses", label: "Курсове" },
            { href: "/gallery", label: "Галерия" },
            { href: "/artists", label: "Артисти" },
            session?.user
                ? { href: "/art/upload", label: "Качи картина" }
                : { href: "/apply", label: "Стани артист" },
        ],
        [session]
    );



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

                                const scroller = getScrollRoot();
                                // изключваме плавния скрол, за да няма „подскачане“
                                const html = document.documentElement as HTMLElement;
                                const prev = html.style.scrollBehavior;
                                html.style.scrollBehavior = "auto";

                                if (isHome) {
                                    // НА началната: скрол до 0 на реалния контейнер
                                    if (scroller instanceof Window) {
                                        scroller.scrollTo({ top: 0, left: 0 });
                                    } else {
                                        (scroller as HTMLElement).scrollTop = 0;
                                    }
                                } else {
                                    // ДРУГА страница: твърда навигация към "/" (top по дефиниция)
                                    if ("scrollRestoration" in history) { history.scrollRestoration = "manual"; }
                                    window.location.assign("/");
                                }

                                // връщаме предишното поведение
                                html.style.scrollBehavior = prev;
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

            {/* HOME HERO – пълен видим екран */}
            {isHome && (
                <section className="x-hero">
                    <div className="mx-auto -mt-10 max-w-7xl w-full px-4 md:px-6">
                        {/* Цитат – отместен под бара */}
                        <div className="pt-8 md:pt-10">
                            <p className="home-quote " aria-label="Всяко гениално изкуство е започнало на празно платно">
                                {`ВСЯКО ГЕНИАЛНО${`\n`}ИЗКУСТВО Е${`\n`}ЗАПОЧНАЛО НА${`\n`}ПРАЗНО ПЛАТНО!`}
                            </p>
                        </div>

                        {/* Долни линкове */}
                        <div className="footer-wrapper">
                            <div className="flex flex-col gap-1">
                                <Link href="/about" className="footer-link">За нас</Link>
                                <Link href="/contact" className="footer-link">{`Контакти`}</Link>
                            </div>
                            <div className="justify-self-end">
                                {session ? (
                                    <Link href="/api/auth/signout" className="footer-link inline-flex items-center gap-2">
                                        <LogOut size={18} /> Изход
                                    </Link>
                                ) : (
                                    <Link href="/login" className="footer-link inline-flex items-center gap-2">
                                        <LogIn size={18} /> Вход
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </>
    );

}
