"use client";

import SplashScreen from "./SplashScreen";

export default function SplashScreenWrapper(): React.JSX.Element {
    const handleComplete = () => {
        // Splash screen completed - no action needed
        console.log("Splash screen completed");
    };

    return <SplashScreen onComplete={handleComplete} />;
}
