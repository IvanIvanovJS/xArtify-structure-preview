"use client";


import Link from "next/link";
import type {
    FC,
    KeyboardEventHandler,
    MouseEventHandler,
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
    revealPersistMs?: number;
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
    const [isTapActive, setIsTapActive] = useState<boolean>(false);
    const [isHover, setIsHover] = useState<boolean>(false);


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


        const tryPlay = (): void => {
            void v.play().catch(() => { });
        };
        const onCanPlay = (): void => tryPlay();


        v.addEventListener("canplay", onCanPlay, { once: true });
        tryPlay();


        return () => {
            v.removeEventListener("canplay", onCanPlay);
        };
    }, []);


    // mobile tap reveal timeout
    useEffect(() => {
        if (!isTapActive || !revealPersistMs) return;
        const t = window.setTimeout(() => setIsTapActive(false), revealPersistMs);
        return () => window.clearTimeout(t);
    }, [isTapActive, revealPersistMs]);


    const activateTap = (): void => {
        if (!revealOnTap) return;
        setIsTapActive(true);
    };
    // Capture on the whole section to overcome iOS/Safari video event quirks
    const onPointerDownCapture: PointerEventHandler<HTMLElement> = () => {
        activateTap();
    };


    const onMouseEnter: MouseEventHandler<HTMLElement> = () => setIsHover(true);
    const onMouseLeave: MouseEventHandler<HTMLElement> = () => setIsHover(false);


    const onMediaKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activateTap();
        }
    };


    const isActive: boolean = isTapActive || isHover;


    return (
        <section
            className={`home-hero home-hero--vh ${className ?? ""}`.trim()}
            aria-label="Лендинг банер видео"
            onPointerDownCapture={onPointerDownCapture}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* .vid-mono върху медия контейнера; класът .is-active се управлява от секцията */}
            <div
                className={`home-hero__media vid-mono${isActive ? " is-active" : ""}`}
                tabIndex={0}
                role="button"
                aria-label="Покажи цветовете"
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