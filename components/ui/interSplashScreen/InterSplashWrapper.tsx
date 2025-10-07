"use client";

import { useInterSplash } from "@/app/context/InterSplashContext";
import InterSplashScreen from "./InterSplashScreen";

export default function InterSplashWrapper(): React.JSX.Element {
    const { isVisible, hideInterSplash } = useInterSplash();

    return (
        <InterSplashScreen
            isVisible={isVisible}
            onComplete={hideInterSplash}
            minDuration={400}
        />
    );
}

