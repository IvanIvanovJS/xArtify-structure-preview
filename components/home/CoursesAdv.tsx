"use client";

import Link from "next/link";
import Image from "next/image";
import type { FC, KeyboardEventHandler, PointerEventHandler, ReactElement } from "react";
import { useEffect, useRef, useState } from "react";

export type CoursesAdvProps = {
    /** Заглавие на секцията */
    title?: string;
    /** Подзаглавие/описание */
    subtitle?: string;
    /** URL на първата снимка */
    image1Url?: string;
    /** URL на втората снимка */
    image2Url?: string;
    /** URL на бутона (засега към курсове) */
    buttonUrl?: string;
    /** Текст на бутона */
    buttonText?: string;
    /** Колко дълго да стои цветно след активиране (ms) */
    revealPersistMs?: number;
    /** След колко ms видимост да покажем подсказката (само мобилни) */
    nudgeDelayMs?: number;
    /** CSS клас за контейнера */
    className?: string;
};

const CoursesAdv: FC<CoursesAdvProps> = ({
    title = "500K",
    subtitle = "най-голямата и активна образователна общност в България",
    image1Url = "/test.jpg",
    image2Url = "/test2.jpg",
    buttonUrl = "/courses",
    buttonText = "ЗАПИШИ СЕ СЕГА",
    revealPersistMs = 5000,
    nudgeDelayMs = 2000,
    className,
}): ReactElement => {
    const sectionRef = useRef<HTMLElement | null>(null);
    const mediaRef = useRef<HTMLDivElement | null>(null);

    // Състояния
    const [isHover, setIsHover] = useState<boolean>(false);
    const [isTapActive, setIsTapActive] = useState<boolean>(false);
    const [showNudge, setShowNudge] = useState<boolean>(false);

    // Таймери
    const hideTimerRef = useRef<number | null>(null);
    const nudgeTimerRef = useRef<number | null>(null);

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

    // Глобален outside-click: ако кликнеш ИЗВЪН секцията → връщаме grayscale
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
        document.addEventListener("pointerdown", onDocPointerDown, true);
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
        setIsTapActive(true);
        setShowNudge(false);
        startHideTimer();
    };

    // Клик вътре в секцията, но ИЗВЪН медията/CTA/мишената → връщаме grayscale
    const onSectionPointerDownCapture: PointerEventHandler<HTMLElement> = (e) => {
        const target = e.target as Node;
        const mediaEl = mediaRef.current;
        const ctaEl = sectionRef.current?.querySelector(".courses-adv__cta") ?? null;
        const nudgeBtn = sectionRef.current?.querySelector(".courses-nudge-btn") ?? null;

        const insideCTA = !!(ctaEl && ctaEl.contains(target));
        const insideNudge = !!(nudgeBtn && nudgeBtn.contains(target));
        if (insideCTA || insideNudge) return;

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
        e.stopPropagation();
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
            className={`courses-adv ${className ?? ""}`.trim()}
            aria-label="Курсове реклама секция"
            onPointerDownCapture={onSectionPointerDownCapture}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
        >
            <div className="courses-adv__container">
                {/* Лява част с текст */}
                <div className="courses-adv__content">
                    <h2 className="courses-adv__title">{title}</h2>
                    <p className="courses-adv__subtitle">{subtitle}</p>
                    <Link href={buttonUrl} className="courses-adv__cta" onPointerDown={onCtaPointerDown}>
                        {buttonText}
                    </Link>
                </div>

                {/* Дясна част с изображения */}
                <div
                    ref={mediaRef}
                    className={`courses-adv__media${isActive ? " is-active is-tap" : ""}`}
                    tabIndex={0}
                    role="img"
                    aria-label="Курсове изображения"
                    onKeyDown={onMediaKeyDown}
                >
                    <div className="courses-adv__image courses-adv__image--main">
                        <Image
                            src={image1Url}
                            alt="Образователна общност"
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                    <div className="courses-adv__image courses-adv__image--secondary">
                        <Image
                            src={image2Url}
                            alt="Студенти в действие"
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                </div>

                {/* Подсказка: показва се само когато НЕ е активно и след nudgeDelayMs на мобилни */}
                {showNudge && !isTapActive && (
                    <button type="button" className="courses-nudge-btn" aria-label="Покажи цветовете">
                        <span className="courses-nudge-bubble" aria-hidden="true">{`Нарисувай ме =>`}</span>
                        <span className="courses-nudge-dot" aria-hidden="true" onPointerDown={onNudgeDotPointerDown} />
                    </button>
                )}
            </div>
        </section>
    );
};

export default CoursesAdv;
