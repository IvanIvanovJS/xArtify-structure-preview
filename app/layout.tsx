// app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import SessionProvider from "@/components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { CartProvider } from "./context/CartContext";
import SessionGuard from "@/components/SessionGuard";
import SiteBackground from "@/components/background/SiteBackground";
import { JSX } from "react";

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
      <body className={inter.className}>
        {/* Фонът трябва да е първи в body, на z-0 */}
        <SiteBackground />

        <SessionProvider session={session}>
          <SessionGuard>
            <CartProvider>
              <Header />
              {/* Съдържанието е над фона */}
              <main className="relative z-10 min-h-[calc(100vh-64px)]">
                {children}
              </main>
            </CartProvider>
          </SessionGuard>
        </SessionProvider>
      </body>
    </html>
  );
}
