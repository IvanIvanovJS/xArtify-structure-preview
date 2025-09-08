"use client";

import Link from "next/link";
import type {
    FC,
    KeyboardEventHandler,
    PointerEventHandler,
    ReactElement,
} from "react";
import { useEffect, useRef, useState } from "react";

export type BannerVideoProps = {
    cloudName?: string;
    publicId?: string;
    posterPublicId?: string;
    posterUrl?: string;
    widthHint?: number;
    className?: string;
    preload?: "none" | "metadata" | "auto";
    /** Разкриване само при целеви действие (CTA/мишена) */
    revealOnTap?: boolean;
    /** Колко дълго да стои цветно след активиране (ms) */
    revealPersistMs?: number;
    /** След колко ms видимост да покажем подсказката (само мобилни) */
    nudgeDelayMs?: number;
};

const buildCldVideoSrc = (
    cloudName: string,
    publicId: string,
    format: "mp4" | "webm",
    widthHint: number
): string => {
    const f = format === "mp4" ? "f_mp4" : "f_webm";
    return `https://res.cloudinary.com/${cloudName}/video/upload/${f},q_auto,w_${widthHint}/${publicId}.${format}`;
};

const buildCldImageSrc = (
    cloudName: string,
    posterPublicId: string,
    widthHint: number
): string => {
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${widthHint}/${posterPublicId}`;
};

const BannerVideo: FC<BannerVideoProps> = ({
    cloudName,
    publicId,
    posterPublicId,
    posterUrl,
    widthHint = 1920,
    className,
    preload = "metadata",
    revealOnTap = true,
    revealPersistMs = 5000,
    nudgeDelayMs = 2000,
}): ReactElement => {
    const useCloudinary: boolean = Boolean(cloudName && publicId);
    const vRef = useRef<HTMLVideoElement | null>(null);
    const sectionRef = useRef<HTMLElement | null>(null);
    const mediaRef = useRef<HTMLDivElement | null>(null);

    // Състояния
    const [isHover, setIsHover] = useState<boolean>(false); // само за desktop (mouse)
    const [isTapActive, setIsTapActive] = useState<boolean>(false); // активира се само от CTA/мишена
    const [showNudge, setShowNudge] = useState<boolean>(false); // подсказка след 5s видимост

    // Таймери
    const hideTimerRef = useRef<number | null>(null);
    const nudgeTimerRef = useRef<number | null>(null);

    const mp4Src: string = useCloudinary
        ? buildCldVideoSrc(cloudName as string, publicId as string, "mp4", widthHint)
        : "/banner-home.mp4";
    const webmSrc: string = useCloudinary
        ? buildCldVideoSrc(cloudName as string, publicId as string, "webm", widthHint)
        : "/banner-home.webm";

    const posterSrc: string | undefined = (() => {
        if (posterUrl) return posterUrl;
        if (useCloudinary && posterPublicId)
            return buildCldImageSrc(cloudName as string, posterPublicId, widthHint);
        return "/banner-home-poster.jpg";
    })();

    // Автоплей/стабилност
    useEffect(() => {
        const v = vRef.current;
        if (!v) return;

        v.muted = true;
        v.defaultMuted = true;
        v.playsInline = true;
        v.setAttribute("playsinline", "");
        v.setAttribute("muted", "");
        v.autoplay = true;
        v.loop = true;

        const tryPlay = (): void => { void v.play().catch(() => { }); };
        const onCanPlay = (): void => tryPlay();

        v.addEventListener("canplay", onCanPlay, { once: true });
        tryPlay();

        return () => { v.removeEventListener("canplay", onCanPlay); };
    }, []);

    // Cleanup таймери
    useEffect(() => () => {
        if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
        if (nudgeTimerRef.current !== null) window.clearTimeout(nudgeTimerRef.current);
    }, []);

    // Показване на подсказката: секцията видима ≥50% за nudgeDelayMs и НЕ е активно
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                const visible = entry.isIntersecting && entry.intersectionRatio > 0.5;
                if (visible && !isTapActive) {
                    if (nudgeTimerRef.current !== null) window.clearTimeout(nudgeTimerRef.current);
                    nudgeTimerRef.current = window.setTimeout(() => {
                        const isHoverNone = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(hover: none)").matches;
                        if (isHoverNone) setShowNudge(true);
                    }, nudgeDelayMs);
                } else {
                    if (nudgeTimerRef.current !== null) window.clearTimeout(nudgeTimerRef.current);
                    setShowNudge(false);
                }
            },
            { threshold: [0, 0.5, 1] }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [nudgeDelayMs, isTapActive]);

    // --- Глобален outside-click: ако кликнеш ИЗВЪН секцията → връщаме grayscale ---
    useEffect(() => {
        const onDocPointerDown = (e: PointerEvent): void => {
            const sec = sectionRef.current;
            if (!sec) return;
            const target = e.target as Node | null;
            if (target && !sec.contains(target)) {
                setIsTapActive(false);
                if (hideTimerRef.current !== null) { window.clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
                // ако е мобилно устройство – покажи подсказката веднага
                const isHoverNone = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(hover: none)").matches;
                if (isHoverNone) setShowNudge(true);
            }
        };
        document.addEventListener("pointerdown", onDocPointerDown, true); // capture
        return () => document.removeEventListener("pointerdown", onDocPointerDown, true);
    }, []);

    // Hover само за мишка (desktop)
    const onPointerEnter: PointerEventHandler<HTMLElement> = (e) => {
        if (e.pointerType === "mouse") setIsHover(true);
    };
    const onPointerLeave: PointerEventHandler<HTMLElement> = (e) => {
        if (e.pointerType === "mouse") setIsHover(false);
    };

    const startHideTimer = (): void => {
        if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = window.setTimeout(() => {
            setIsTapActive(false);
            hideTimerRef.current = null;
            // мигновено връщаме подсказката на мобилни, щом цветът угасне
            const isHoverNone = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(hover: none)").matches;
            if (isHoverNone) setShowNudge(true);
        }, revealPersistMs);
    };

    // Активиране САМО от CTA или мишената
    const activateTap = (): void => {
        if (!revealOnTap) return;
        setIsTapActive(true);
        setShowNudge(false);
        startHideTimer();
    };

    // Клик вътре в секцията, но ИЗВЪН медията/CTA/мишената → връщаме grayscale
    const onSectionPointerDownCapture: PointerEventHandler<HTMLElement> = (e) => {
        const target = e.target as Node;
        const mediaEl = mediaRef.current;
        const ctaEl = sectionRef.current?.querySelector(".home-hero__cta") ?? null;
        const nudgeBtn = sectionRef.current?.querySelector(".hero-nudge-btn") ?? null;

        const insideCTA = !!(ctaEl && ctaEl.contains(target));
        const insideNudge = !!(nudgeBtn && nudgeBtn.contains(target));
        if (insideCTA || insideNudge) return; // ще се обработят по съответните handler-и

        const insideMedia = !!(mediaEl && mediaEl.contains(target));
        if (!insideMedia) {
            setIsTapActive(false);
            if (hideTimerRef.current !== null) { window.clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
            const isHoverNone = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(hover: none)").matches;
            if (isHoverNone) setShowNudge(true);
        }
    };

    // CTA: активира на pointerdown, без да пречим на навигацията
    const onCtaPointerDown: PointerEventHandler<HTMLAnchorElement> = () => { activateTap(); };

    // Мишена: активира само при тап по ТОЧКАТА, не по целия бутон
    const onNudgeDotPointerDown: PointerEventHandler<HTMLSpanElement> = (e) => {
        e.preventDefault();
        e.stopPropagation(); // да не стига до section capture
        activateTap();
    };

    const onMediaKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            const isHoverNone = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(hover: none)").matches;
            if (isHoverNone) { e.preventDefault(); activateTap(); }
        }
    };

    // Комбинирано състояние за класа is-active (desktop hover ИЛИ мобилен tap)
    const isActive: boolean = isHover || isTapActive;

    return (
        <section
            ref={sectionRef}
            className={`home-hero home-hero--vh ${className ?? ""}`.trim()}
            aria-label="Лендинг банер видео"
            onPointerDownCapture={onSectionPointerDownCapture}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
        >
            <div
                ref={mediaRef}
                className={`home-hero__media vid-mono${isActive ? " is-active is-tap" : ""}`}
                tabIndex={0}
                role="img"
                aria-label="Лендинг видео"
                onKeyDown={onMediaKeyDown}
            >
                <video
                    ref={vRef}
                    className="home-hero__video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload={preload}
                    poster={posterSrc}
                    controls={false}
                    disablePictureInPicture
                    controlsList="nodownload noremoteplayback noplaybackrate nofullscreen"
                >
                    <source src={webmSrc} type="video/webm" />
                    <source src={mp4Src} type="video/mp4" />
                </video>
                <div className="home-hero__overlay" aria-hidden="true" />
            </div>

            <div className="home-hero__inner">
                <div className="home-hero__content">
                    <h1 className="home-hero__title">Изкуството е за всеки!</h1>
                    <p className="home-hero__subtitle">Привестваме всички любители и професионалисти да се запознаят с нашата обучителна програма.</p>

                    <Link href="/courses" className="home-hero__cta" onPointerDown={onCtaPointerDown}>
                        ЗАПИШИ СЕ СЕГА
                    </Link>

                    {/* Подсказка: показва се само когато НЕ е активно и след nudgeDelayMs на мобилни */}
                    {showNudge && !isTapActive && (
                        <button type="button" className="hero-nudge-btn" aria-label="Покажи цветовете">
                            <span className="hero-nudge-bubble" aria-hidden="true">{`Нарисувай ме =>`}</span>
                            <span className="hero-nudge-dot" aria-hidden="true" onPointerDown={onNudgeDotPointerDown} />
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BannerVideo;
