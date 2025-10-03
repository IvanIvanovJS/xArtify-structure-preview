"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./styles/inter-splash-screen.css";

interface InterSplashScreenProps {
    isVisible: boolean;
    onComplete: () => void;
}

export default function InterSplashScreen({ isVisible }: InterSplashScreenProps): React.JSX.Element {
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        if (isVisible) {
            // Start loading animation immediately
            setShowLoading(true);
        } else {
            // Hide loading when splash is hidden
            setShowLoading(false);
        }
    }, [isVisible]);

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 0.1,
                        ease: "easeInOut"
                    }}
                    className="inter-splash-screen"
                >
                    {/* Dark background */}
                    <div className="inter-splash-background" />

                    {/* Loading Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                            opacity: showLoading ? 1 : 0,
                            y: showLoading ? 0 : 20
                        }}
                        exit={{
                            opacity: 0,
                            y: -20
                        }}
                        transition={{
                            duration: 0.2,
                            ease: "easeOut"
                        }}
                        className="inter-splash-loading"
                    >
                        <div className="inter-splash-loading-bar">
                            <motion.div
                                className="inter-splash-loading-progress"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{
                                    duration: 0.4,
                                    ease: "easeInOut",
                                    delay: 0.1
                                }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

