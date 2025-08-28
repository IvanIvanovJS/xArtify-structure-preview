// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import SessionProvider from "@/components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { CartProvider } from "./context/CartContext";
import SessionGuard from "@/components/SessionGuard"


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Art Platform",
  description: "Открийте и създайте вашето изкуство.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  // const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="bg">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <SessionGuard>
            <CartProvider>
              <Header />
              <main className="min-h-[calc(100vh-64px)]">{children}</main>

            </CartProvider>
          </SessionGuard>
        </SessionProvider>
      </body>
    </html>
  );
}