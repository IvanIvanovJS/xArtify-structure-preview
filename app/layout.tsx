
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header"; // <-- Уверете се, че импортирате Header
import SessionProvider from "@/components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
          <Header /> {/* <-- Добавете Header компонента тук */}
          <main className="min-h-[calc(100vh-64px)]">{children}</main> {/* <-- Добавете класове за минимална височина на main */}
        </SessionProvider>
      </body>
    </html>
  );
}