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
    revealOnTap?: boolean;
    /** Колко дълго след tap да стои цветно (само мобилен режим) */
    revealPersistMs?: number;
    /** След колко време видимост да се появи подсказката (ms) – по подразбиране 5000 */
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
    nudgeDelayMs = 5000,
}): ReactElement => {
    const useCloudinary: boolean = Boolean(cloudName && publicId);
    const vRef = useRef<HTMLVideoElement | null>(null);
    const sectionRef = useRef<HTMLElement | null>(null);

    // Desktop hover (mouse) vs. mobile tap (touch/pen)
    const [isHover, setIsHover] = useState<boolean>(false); // само за mouse
    const [isTapActive, setIsTapActive] = useState<boolean>(false); // само за touch/pen
    const [showNudge, setShowNudge] = useState<boolean>(false); // подсказка след 5s

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

    // autoplay + loop hardening
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

    // Cleanup таймери при unmount
    useEffect(() => () => {
        if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
        if (nudgeTimerRef.current !== null) window.clearTimeout(nudgeTimerRef.current);
    }, []);

    // 1) Hover да се сетва САМО ако pointerType е mouse (да не чупим мобилния tap)
    const onPointerEnter: PointerEventHandler<HTMLElement> = (e) => {
        if (e.pointerType === "mouse") setIsHover(true);
    };
    const onPointerLeave: PointerEventHandler<HTMLElement> = (e) => {
        if (e.pointerType === "mouse") setIsHover(false);
    };

    // 2) Tap reveal (touch/pen) + таймер с revealPersistMs
    const activateTap = (): void => {
        if (!revealOnTap) return;
        setIsTapActive(true);
        if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = window.setTimeout(() => {
            setIsTapActive(false);
            hideTimerRef.current = null;
        }, revealPersistMs);
    };

    const onPointerDownCapture: PointerEventHandler<HTMLElement> = (e) => {
        if (e.pointerType === "touch" || e.pointerType === "pen") activateTap();
    };

    const onMediaKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            const isHoverNone = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(hover: none)").matches;
            if (isHoverNone) { e.preventDefault(); activateTap(); }
        }
    };

    // 3) Показване на подсказката (мишена + „нарисувай ме“) след като секцията е видима >= nudgeDelayMs
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.5;
                if (isVisible) {
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
    }, [nudgeDelayMs]);

    const onNudgePress: PointerEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        if (e.pointerType === "touch" || e.pointerType === "pen") {
            setShowNudge(false);
            activateTap();
        }
    };

    const isActive: boolean = isHover || isTapActive;

    return (
        <section
            ref={sectionRef}
            className={`home-hero home-hero--vh ${className ?? ""}`.trim()}
            aria-label="Лендинг банер видео"
            onPointerDownCapture={onPointerDownCapture}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
        >
            <div
                className={`home-hero__media vid-mono${isActive ? " is-active" : ""}${isTapActive ? " is-tap" : ""}`}
                tabIndex={0}
                role="button"
                aria-label="Покажи цветовете"
                onKeyDown={onMediaKeyDown}
            >
                {/* Долният слой: grayscale база (чрез CSS) */}
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
                {/* Горният слой: цветна маска (ако я ползваш) */}
                {/* <video className="home-hero__video gs-mask" ...> ... </video> */}

                <div className="home-hero__overlay" aria-hidden="true" />
            </div>

            <div className="home-hero__inner">
                <div className="home-hero__content">
                    <h1 className="home-hero__title">Изкуството е за всеки!</h1>
                    <p className="home-hero__subtitle">Привестваме всички любители и професионалисти да се запознаят с нашата обучителна програма.</p>
                    <Link href="/courses" className="home-hero__cta mt-16">ЗАПИШИ СЕ СЕГА</Link>

                    {/* Подсказка: кръгче + балонче в долния десен ъгъл (само мобилни – показва се чрез showNudge) */}
                    {showNudge && !isTapActive && (
                        <button
                            type="button"
                            className="hero-nudge-btn"
                            aria-label="Покажи цветовете"
                            onPointerDown={onNudgePress}
                        >
                            <span className="hero-nudge-bubble" aria-hidden="true">{"Нарисувай ме =>"}</span>
                            <span className="hero-nudge-dot" aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BannerVideo;
