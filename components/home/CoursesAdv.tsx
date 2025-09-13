"use client";

import Link from "next/link";
import Image from "next/image";
import type { FC, KeyboardEventHandler, PointerEventHandler, ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { FolderOpen, Upload } from "lucide-react";

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
    const { data: session } = useSession();
    const sectionRef = useRef<HTMLElement | null>(null);
    const mediaRef = useRef<HTMLDivElement | null>(null);
    const fileInput1Ref = useRef<HTMLInputElement | null>(null);
    const fileInput2Ref = useRef<HTMLInputElement | null>(null);

    // Състояния
    const [isHover, setIsHover] = useState<boolean>(false);
    const [isTapActive, setIsTapActive] = useState<boolean>(false);
    const [showNudge, setShowNudge] = useState<boolean>(false);

    // Admin състояния
    const [currentImage1, setCurrentImage1] = useState<string>(image1Url);
    const [currentImage2, setCurrentImage2] = useState<string>(image2Url);
    const [isUploading1, setIsUploading1] = useState<boolean>(false);
    const [isUploading2, setIsUploading2] = useState<boolean>(false);
    const [showAdminControls, setShowAdminControls] = useState<boolean>(false);

    // Content editing състояния
    const [currentTitle, setCurrentTitle] = useState<string>(title);
    const [currentSubtitle, setCurrentSubtitle] = useState<string>(subtitle);
    const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
    const [isEditingSubtitle, setIsEditingSubtitle] = useState<boolean>(false);
    const [isSavingContent, setIsSavingContent] = useState<boolean>(false);

    // Таймери
    const hideTimerRef = useRef<number | null>(null);
    const nudgeTimerRef = useRef<number | null>(null);

    // Cleanup таймери
    useEffect(() => () => {
        if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
        if (nudgeTimerRef.current !== null) window.clearTimeout(nudgeTimerRef.current);
    }, []);

    // Зареждане на контента от базата данни при инициализация
    useEffect(() => {
        const loadContent = async () => {
            try {
                const response = await fetch("/api/home/updateContent");
                const result = await response.json();

                if (result.success && result.data) {
                    setCurrentTitle(result.data.title);
                    setCurrentSubtitle(result.data.subtitle);
                    // Зареждаме изображенията от базата данни
                    if (result.data.image1Url) {
                        setCurrentImage1(result.data.image1Url);
                    }
                    if (result.data.image2Url) {
                        setCurrentImage2(result.data.image2Url);
                    }
                }
            } catch (error) {
                console.error("Error loading content:", error);
                // Използваме default стойностите ако има грешка
            }
        };

        loadContent();
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

    // Admin функции
    const isAdmin = session?.user?.role === "ADMIN";

    const handleImageUpload = async (file: File, imageNumber: 1 | 2) => {
        if (!file) return;

        const setIsUploading = imageNumber === 1 ? setIsUploading1 : setIsUploading2;
        const setCurrentImage = imageNumber === 1 ? setCurrentImage1 : setCurrentImage2;

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("folder", "courses-adv");

            const response = await fetch("/api/home/uploadImage", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setCurrentImage(result.url);
                // Автоматично запазваме новия URL в базата данни
                await saveContentWithNewImage(result.url, imageNumber);
            } else {
                alert(`Грешка при качване: ${result.error}`);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Грешка при качване на изображението");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, imageNumber: 1 | 2) => {
        const file = event.target.files?.[0];
        if (file) {
            handleImageUpload(file, imageNumber);
        }
    };

    const triggerFileInput = (imageNumber: 1 | 2) => {
        const inputRef = imageNumber === 1 ? fileInput1Ref : fileInput2Ref;
        inputRef.current?.click();
    };

    // Content editing функции
    const saveContent = async () => {
        setIsSavingContent(true);
        try {
            const response = await fetch("/api/home/updateContent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: currentTitle,
                    subtitle: currentSubtitle,
                    image1Url: currentImage1,
                    image2Url: currentImage2,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Успешно запазено
                setIsEditingTitle(false);
                setIsEditingSubtitle(false);
            } else {
                alert(`Грешка при запазване: ${result.error}`);
            }
        } catch (error) {
            console.error("Save content error:", error);
            alert("Грешка при запазване на промените");
        } finally {
            setIsSavingContent(false);
        }
    };

    const saveContentWithNewImage = async (newImageUrl: string, imageNumber: 1 | 2) => {
        setIsSavingContent(true);
        try {
            const image1Url = imageNumber === 1 ? newImageUrl : currentImage1;
            const image2Url = imageNumber === 2 ? newImageUrl : currentImage2;

            const response = await fetch("/api/home/updateContent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: currentTitle,
                    subtitle: currentSubtitle,
                    image1Url: image1Url,
                    image2Url: image2Url,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Успешно запазено
                console.log("Image saved successfully");
            } else {
                alert(`Грешка при запазване на изображението: ${result.error}`);
            }
        } catch (error) {
            console.error("Save image error:", error);
            alert("Грешка при запазване на изображението");
        } finally {
            setIsSavingContent(false);
        }
    };

    const handleTitleDoubleClick = () => {
        if (isAdmin) {
            setIsEditingTitle(true);
        }
    };

    const handleSubtitleDoubleClick = () => {
        if (isAdmin) {
            setIsEditingSubtitle(true);
        }
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            saveContent();
        } else if (e.key === "Escape") {
            setCurrentTitle(title);
            setIsEditingTitle(false);
        }
    };

    const handleSubtitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            saveContent();
        } else if (e.key === "Escape") {
            setCurrentSubtitle(subtitle);
            setIsEditingSubtitle(false);
        }
    };

    const handleTitleBlur = () => {
        if (currentTitle !== title) {
            saveContent();
        } else {
            setIsEditingTitle(false);
        }
    };

    const handleSubtitleBlur = () => {
        if (currentSubtitle !== subtitle) {
            saveContent();
        } else {
            setIsEditingSubtitle(false);
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
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={currentTitle}
                            onChange={(e) => setCurrentTitle(e.target.value)}
                            onKeyDown={handleTitleKeyDown}
                            onBlur={handleTitleBlur}
                            className="courses-adv__title courses-adv__title--editing"
                            autoFocus
                            disabled={isSavingContent}
                        />
                    ) : (
                        <h2
                            className={`courses-adv__title ${isAdmin ? 'courses-adv__title--editable' : ''}`}
                            onDoubleClick={handleTitleDoubleClick}
                            title={isAdmin ? "Двойно кликване за редактиране" : undefined}
                        >
                            {currentTitle}
                            {isAdmin && <span className="courses-adv__edit-hint">✏️</span>}
                        </h2>
                    )}

                    {isEditingSubtitle ? (
                        <textarea
                            value={currentSubtitle}
                            onChange={(e) => setCurrentSubtitle(e.target.value)}
                            onKeyDown={handleSubtitleKeyDown}
                            onBlur={handleSubtitleBlur}
                            className="courses-adv__subtitle courses-adv__subtitle--editing"
                            autoFocus
                            disabled={isSavingContent}
                            rows={3}
                        />
                    ) : (
                        <p
                            className={`courses-adv__subtitle ${isAdmin ? 'courses-adv__subtitle--editable' : ''}`}
                            onDoubleClick={handleSubtitleDoubleClick}
                            title={isAdmin ? "Двойно кликване за редактиране" : undefined}
                        >
                            {currentSubtitle}
                            {isAdmin && <span className="courses-adv__edit-hint">✏️</span>}
                        </p>
                    )}

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
                    onMouseEnter={() => isAdmin && setShowAdminControls(true)}
                    onMouseLeave={() => isAdmin && setShowAdminControls(false)}
                >
                    <div className="courses-adv__image courses-adv__image--main">
                        <Image
                            src={currentImage1}
                            alt="Образователна общност"
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                        {/* Admin upload контрол за първото изображение */}
                        {isAdmin && (
                            <div className={`courses-adv__admin-control ${showAdminControls ? 'is-visible' : ''}`}>
                                <button
                                    type="button"
                                    className="courses-adv__upload-btn"
                                    onClick={() => triggerFileInput(1)}
                                    disabled={isUploading1}
                                    title="Смени изображение"
                                >
                                    {isUploading1 ? (
                                        <Upload size={16} className="animate-spin" />
                                    ) : (
                                        <FolderOpen size={16} />
                                    )}
                                </button>
                                <input
                                    ref={fileInput1Ref}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileSelect(e, 1)}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="courses-adv__image courses-adv__image--secondary">
                        <Image
                            src={currentImage2}
                            alt="Студенти в действие"
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                        {/* Admin upload контрол за второто изображение */}
                        {isAdmin && (
                            <div className={`courses-adv__admin-control ${showAdminControls ? 'is-visible' : ''}`}>
                                <button
                                    type="button"
                                    className="courses-adv__upload-btn"
                                    onClick={() => triggerFileInput(2)}
                                    disabled={isUploading2}
                                    title="Смени изображение"
                                >
                                    {isUploading2 ? (
                                        <Upload size={16} className="animate-spin" />
                                    ) : (
                                        <FolderOpen size={16} />
                                    )}
                                </button>
                                <input
                                    ref={fileInput2Ref}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileSelect(e, 2)}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        )}
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
