"use client";

import Link from "next/link";
import type { FC, KeyboardEventHandler, ReactElement } from "react";
import { useEffect, useRef, useState } from "react";

export type BannerVideoProps = {
    cloudName?: string; // напр. "dqrjc4pwr"
    publicId?: string; // напр. "xartify/banner-home"
    posterPublicId?: string; // напр. "banner-home-poster"
    posterUrl?: string; // пълен URL (ако искаш точно определен)
    widthHint?: number; // по подразбиране 1920
    className?: string;
    preload?: "none" | "metadata" | "auto"; // default "metadata"
    revealOnTap?: boolean; // мобилен „tap-to-reveal“ (по подразбиране true тук)
    revealPersistMs?: number; // колко да стои цветно след tap
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
    revealPersistMs = 3500,
}): ReactElement => {
    const useCloudinary: boolean = Boolean(cloudName && publicId);
    const vRef = useRef<HTMLVideoElement | null>(null);
    const [isActive, setIsActive] = useState<boolean>(false); // мобилен tap→разкриване

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

    // autoplay + loop hardening (iOS/Android)
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

        const tryPlay = (): void => {
            void v.play().catch(() => {
                /* ignore */
            });
        };
        const onCanPlay = (): void => tryPlay();

        v.addEventListener("canplay", onCanPlay, { once: true });
        tryPlay();

        return () => {
            v.removeEventListener("canplay", onCanPlay);
        };
    }, []);

    // мобилен „tap-to-reveal“ auto-hide
    useEffect(() => {
        if (!isActive || !revealPersistMs) return;
        const t = window.setTimeout(() => setIsActive(false), revealPersistMs);
        return () => window.clearTimeout(t);
    }, [isActive, revealPersistMs]);

    const activate = (): void => {
        if (!revealOnTap) return;
        setIsActive(true);
    };

    const handlePointerDown = (): void => { activate(); };

    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activate();
        }
    };

    return (
        <section
            className={`home-hero home-hero--vh ${className ?? ""}`.trim()}
            aria-label="Лендинг банер видео"
        >
            {/* ВАЖНО: .vid-mono е върху медия контейнера, за да работят sibling селекторите към CTA */}
            <div
                className={`home-hero__media vid-mono${isActive ? " is-active" : ""}`}
                tabIndex={0}
                role="button"
                aria-label="Покажи цветовете"
                onPointerDown={handlePointerDown}
                onKeyDown={handleKeyDown}
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
                    <p className="home-hero__subtitle">
                        Привестваме всички любители и професионалисти да се запознаят с нашата обучителна програма.
                    </p>
                    <Link href="/courses" className="home-hero__cta">
                        ЗАПИШИ СЕ СЕГА
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default BannerVideo;