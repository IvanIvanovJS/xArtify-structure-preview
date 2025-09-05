// File: components/BannerVideo.tsx
// Purpose: Make autoplay+loop extremely reliable across iOS Safari / Android Chrome.
// - Keeps Cloudinary/local logic from the previous version
// - Programmatically enforces muted/playsInline and calls play() on mount + when ready

import Link from "next/link";
import type { FC, ReactElement } from "react";
import { useEffect, useRef } from "react";

export type BannerVideoProps = {
    cloudName?: string;
    publicId?: string;
    posterPublicId?: string;
    posterUrl?: string;
    widthHint?: number;
    className?: string;
    preload?: "none" | "metadata" | "auto"; // default "metadata"
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
}): ReactElement => {
    const useCloudinary: boolean = Boolean(cloudName && publicId);
    const vRef = useRef<HTMLVideoElement | null>(null);

    const mp4Src: string = useCloudinary
        ? buildCldVideoSrc(cloudName as string, publicId as string, "mp4", widthHint)
        : "/banner-home.mp4";

    const webmSrc: string = useCloudinary
        ? buildCldVideoSrc(cloudName as string, publicId as string, "webm", widthHint)
        : "/banner-home.webm";

    const posterSrc: string | undefined = (() => {
        if (posterUrl) return posterUrl;
        if (useCloudinary && posterPublicId) return buildCldImageSrc(cloudName as string, posterPublicId, widthHint);
        return "/banner-home-poster.jpg";
    })();

    useEffect(() => {
        const v = vRef.current;
        if (!v) return;

        // Hard-set attributes/properties for iOS/Android quirks
        v.muted = true;
        v.defaultMuted = true; // TS: defaultMuted exists, but cast keeps strictness elsewhere
        v.playsInline = true;
        v.setAttribute("playsinline", "");
        v.setAttribute("muted", "");
        v.autoplay = true;
        v.loop = true;

        const tryPlay = () => {
            v.play().catch(() => {
                // If autoplay was blocked momentarily, try once more when canplay fires
            });
        };

        const onCanPlay = () => tryPlay();

        v.addEventListener("canplay", onCanPlay, { once: true });
        tryPlay();

        return () => {
            v.removeEventListener("canplay", onCanPlay);
        };
    }, []);

    return (
        <section className={`home-hero home-hero--vh ${className ?? ""}`.trim()} aria-label="Лендинг банер видео">
            <div className="home-hero__media" aria-hidden>

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

                <div className="home-hero__overlay" />
            </div>

            <div className="home-hero__inner">
                <div className="home-hero__content  ">
                    <h1 className="home-hero__title">Изкуството е за всеки!</h1>
                    <p className="home-hero__subtitle ">Привестваме всички любители и професионалисти да се запознаят с нашата обучителна програма.</p>
                    <Link href="/courses">
                        <button className="cursor-pointer bg-primary-light text-gray-100 text-xl hover:bg-black  px-4 py-2 rounded mt-26">ЗАПИШИ СЕ СЕГА</button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default BannerVideo;

