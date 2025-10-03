// app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/header/Header";
import SessionProvider from "@/components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { CartProvider } from "./context/CartContext";
import { InterSplashProvider } from "./context/InterSplashContext";
import SessionGuard from "@/components/SessionGuard";
import SiteBackground from "@/components/background/SiteBackground";
import { JSX } from "react";
import MainWrapper from "@/components/MainWrapper";
import SplashScreenWrapper from "@/components/ui/SplashScreenWrapper";
import InterSplashWrapper from "@/components/ui/interSplashScreen/InterSplashWrapper";
import NavigationManager from "@/components/ui/interSplashScreen/NavigationManager";
import NetworkActivityTracker from "@/components/ui/interSplashScreen/NetworkActivityTracker";
import SlowServerDetector from "@/components/ui/interSplashScreen/SlowServerDetector";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "xArtify - Where Art Knows You",
  description: "Art for everyone",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);

  return (
    <html lang="bg">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className} style={{ overflow: "hidden" }}>
        {/* SSR Cover to avoid initial flash; removed by SplashScreen on client */}
        <div
          id="splash-ssr-cover"
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "#000",
            zIndex: 2147483647
          }}
        />
        {/* Splash Screen - първото нещо което се показва */}
        <SplashScreenWrapper />

        {/* Фонът трябва да е първи в body, на z-0 */}
        <SiteBackground />

        <SessionProvider session={session}>
          <SessionGuard>
            <CartProvider>
              <InterSplashProvider>
                <Header />
                {/* Съдържанието е над фона */}
                <MainWrapper>
                  {children}
                </MainWrapper>
                {/* Inter Splash Screen for page transitions */}
                <InterSplashWrapper />
                {/* Navigation manager to hide splash when navigation completes */}
                <NavigationManager />
                {/* Network activity tracker to hide splash when all requests complete */}
                <NetworkActivityTracker />
                {/* Slow server detector for local development */}
                <SlowServerDetector />
              </InterSplashProvider>
            </CartProvider>
          </SessionGuard>
        </SessionProvider>
      </body>
    </html>
  );
}
