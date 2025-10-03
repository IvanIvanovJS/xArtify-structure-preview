"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import "./styles/splash-screen.css";

interface SplashScreenProps {
    onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps): React.JSX.Element {
    const [isVisible, setIsVisible] = useState<boolean>(true); // Start visible immediately
    const [showLoading, setShowLoading] = useState(false);
    const [showLogo, setShowLogo] = useState(false);
    const [showTitle, setShowTitle] = useState(false);

    useEffect(() => {
        // Check if splash should be shown
        const hasSeen = sessionStorage.getItem('xartify-splash-seen');
        const shouldShow = !hasSeen;

        if (shouldShow) {
            sessionStorage.setItem('xartify-splash-seen', 'true');
            // Hide SSR cover immediately
            const cover = document.getElementById('splash-ssr-cover');
            if (cover) cover.classList.add('hidden');

            // Start animation sequence immediately
            setTimeout(() => setShowLogo(true), 200);
            setTimeout(() => setShowTitle(true), 400);
            setTimeout(() => setShowLoading(true), 1000);

            // Complete after 1000ms loading
            setTimeout(() => {
                setIsVisible(false);
                onComplete();
                document.body.style.overflow = '';
            }, 2000);
        } else {
            // No splash this session: hide immediately
            setIsVisible(false);
            const cover = document.getElementById('splash-ssr-cover');
            if (cover) cover.classList.add('hidden');
            // Restore scroll as we skip splash
            document.body.style.overflow = '';
        }
    }, [onComplete]);

    // Lock scroll immediately when component mounts
    useLayoutEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);


    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0
                    }}
                    transition={{
                        duration: 1.1,
                        ease: "easeInOut"
                    }}
                    className="splash-screen"
                >
                    {/* Background with gradient */}
                    <div className="splash-background" />

                    {/* Logo with moon shadow */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -20 }}
                        animate={{
                            opacity: showLogo ? 1 : 0,
                            scale: showLogo ? 1 : 0.8,
                            y: showLogo ? 0 : -20
                        }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.2
                        }}
                        className="splash-logo"
                    >
                        <Image
                            src="/web-logo.svg"
                            width={80}
                            height={80}
                            alt="xArtify Logo"
                            className="splash-logo-image"
                        />
                    </motion.div>

                    {/* Animated Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                            opacity: showTitle ? 1 : 0,
                            y: showTitle ? 0 : 20
                        }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.6
                        }}
                        className="splash-title"
                    >
                        {['x', 'A', 'r', 't', 'i', 'f', 'y'].map((letter, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: showTitle ? 1 : 0,
                                    y: showTitle ? 0 : 20
                                }}
                                transition={{
                                    duration: 0.6,
                                    ease: "easeOut",
                                    delay: 0.6 + (index * 0.1)
                                }}
                                className="splash-title-letter"
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </motion.div>

                    {/* Loading Bar */}
                    <AnimatePresence>
                        {showLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{
                                    opacity: 1,
                                    y: 0
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -20
                                }}
                                transition={{
                                    duration: 0.7,
                                    ease: "easeOut",
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
                                                duration: 1.0,
                                                ease: "easeInOut",
                                                delay: 0.1
                                            }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
