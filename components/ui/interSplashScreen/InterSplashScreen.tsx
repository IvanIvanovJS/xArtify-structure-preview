"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./styles/inter-splash-screen.css";

interface InterSplashScreenProps {
    isVisible: boolean;
    onComplete?: () => void;      // optional callback when exit finishes
    minDuration?: number;         // minimal visible time in ms
    label?: string;               // текст/лого, по подразбиране "xArtify"
}

export default function InterSplashScreen({
    isVisible,
    onComplete,
    minDuration = 300,
}: InterSplashScreenProps): React.JSX.Element {
    const [show, setShow] = useState(isVisible);
    const showStartTsRef = useRef<number | null>(null);

    // sink visible prop -> local show (за да контролираме анимации)
    useEffect(() => {
        if (isVisible) {
            setShow(true);
            showStartTsRef.current = performance.now();
        } else {
            // оставяме show да се скрие след exit анимацията (AnimatePresence ще го махне),
            // но искаме да гарантираме minDuration
            const now = performance.now();
            const elapsed = showStartTsRef.current ? Math.max(0, now - showStartTsRef.current) : Infinity;
            const remaining = Math.max(0, minDuration - elapsed);
            const t = setTimeout(() => setShow(false), remaining);
            return () => clearTimeout(t);
        }
    }, [isVisible, minDuration]);

    return (
        <AnimatePresence
            onExitComplete={() => {
                // когато exit анимацията е приключила -> callback
                onComplete?.();
            }}
        >
            {show && (
                <motion.div
                    className="inter-splash-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    aria-hidden={!isVisible}
                >
                    <div className="inter-splash-inner" role="presentation">
                        <div className="inter-splash-loading-bar" aria-hidden="true">
                            <motion.div
                                className="inter-splash-loading-progress"
                                animate={{
                                    x: ["-50%", "150%", "-50%"]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

