"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./styles/splash-screen.css";

interface SplashScreenProps {
    onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps): React.JSX.Element {
    // Render nothing on server; on client decide visibility
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [fadeStarted, setFadeStarted] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Detect mobile device
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        // Decide on client to prevent hydration mismatch
        const hasSeen = sessionStorage.getItem('xartify-splash-seen');
        const shouldShow = !hasSeen;
        setIsVisible(shouldShow);
        if (shouldShow) {
            sessionStorage.setItem('xartify-splash-seen', 'true');
        } else {
            // No splash this session: hide SSR cover immediately
            const cover = document.getElementById('splash-ssr-cover');
            if (cover) cover.classList.add('hidden');
            // Restore scroll as we skip splash
            document.body.style.overflow = '';
        }
    }, []);

    // When splash is going to be shown, remove the SSR cover only after splash is mounted
    useLayoutEffect(() => {
        if (!isVisible) return;
        const splashEl = document.querySelector('.splash-screen');
        if (splashEl) {
            // Keep scroll locked while splash visible
            document.body.style.overflow = 'hidden';
            // Hide the SSR cover after splash has been committed and is ready to paint
            const cover = document.getElementById('splash-ssr-cover');
            if (cover) {
                // Delay hiding to next paint to avoid any flash
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        cover.classList.add('hidden');
                    });
                });
            }
        }
    }, [isVisible]);

    const handleVideoEnd = () => {
        console.log("Video ended - starting fade and loading");

        // Start fade immediately when video ends
        setFadeStarted(true);
        setShowLoading(true);

        // Wait for loading bar to complete (1.2s) + extra time for visibility
        setTimeout(() => {
            setIsVisible(false);
            onComplete();
            // Ensure SSR cover stays hidden and restore scroll
            const cover = document.getElementById('splash-ssr-cover');
            if (cover) cover.classList.add('hidden');
            document.body.style.overflow = '';
        }, 1500); // Reduced to 1.5s for better timing
    };

    // Manage body overflow
    useEffect(() => {
        if (isVisible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isVisible]);

    return (
        <>

            <AnimatePresence mode="wait">
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{
                            opacity: 0
                        }}
                        transition={{
                            duration: 0.8,
                            ease: "easeInOut"
                        }}
                        className="splash-screen"
                    >
                        {/* Video Background */}
                        <div className="relative w-full h-full overflow-hidden">
                            <video
                                ref={videoRef}
                                className="splash-video"
                                autoPlay
                                muted
                                playsInline
                                onEnded={handleVideoEnd}
                            >
                                <source
                                    src={isMobile ? "/entry-splash-screen.mp4" : "/entry-splash-screen.mp4"}
                                    type="video/mp4"
                                />
                                {/* Fallback for browsers that don't support video */}
                                <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
                            </video>

                            {/* Gradient Overlay */}
                            <div className="splash-overlay" />

                            {/* Fade Overlay - starts when video ends */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: fadeStarted ? 1 : 0 }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                                className="splash-fade"
                            />

                            {/* Loading Bar */}
                            <AnimatePresence>
                                {showLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: -20,
                                            scale: 0.9
                                        }}
                                        transition={{
                                            duration: 0.4,
                                            ease: [0.4, 0, 0.2, 1],
                                            delay: 0.1
                                        }}
                                        className="splash-loading"
                                    >
                                        <div className="splash-loading-content">
                                            <span className="splash-loading-text">Зареждане...</span>
                                            <div className="splash-loading-bar">
                                                <motion.div
                                                    className="splash-loading-progress"
                                                    initial={{ width: "0%" }}
                                                    animate={{ width: "100%" }}
                                                    transition={{
                                                        duration: 1.2,
                                                        ease: "easeInOut",
                                                        delay: 0.05
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
