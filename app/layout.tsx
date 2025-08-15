// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import SessionProvider from "@/components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CartProvider } from "./context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Art Platform",
  description: "Открийте и създайте вашето изкуство.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="bg">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className}>
        <SessionProvider session={session}>
          {/* Обгръщаме всичко с CartProvider */}
          <CartProvider>
            <Header />
            <main className="min-h-[calc(100vh-64px)]">{children}</main>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
