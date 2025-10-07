"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";

interface InterSplashContextType {
    isVisible: boolean;
    showInterSplash: () => void;
    hideInterSplash: () => void;
}

const InterSplashContext = createContext<InterSplashContextType | undefined>(undefined);

export function InterSplashProvider({ children }: { children: ReactNode }): React.JSX.Element {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showInterSplash = (): void => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setIsVisible(true);

        // Set a fallback timeout to ensure splash doesn't stay forever
        timeoutRef.current = setTimeout(() => {
            console.log('InterSplash: Fallback timeout - hiding splash');
            setIsVisible(false);
        }, 5000); // 5 second maximum
    };

    const hideInterSplash = (): void => {
        // Clear timeout when manually hiding
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setIsVisible(false);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <InterSplashContext.Provider value={{ isVisible, showInterSplash, hideInterSplash }}>
            {children}
        </InterSplashContext.Provider>
    );
}

export function useInterSplash(): InterSplashContextType {
    const context = useContext(InterSplashContext);
    if (context === undefined) {
        throw new Error("useInterSplash must be used within an InterSplashProvider");
    }
    return context;
}

