"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import BannerVideo from "@/components/home/BannerVideo";
import HomeHero from "@/components/home/HomeHero";
import CoursesAdv from "@/components/home/CoursesAdv";

export default function HomePage() {
  const { data: session, status } = useSession();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? "dqrjc4pwr";

  if (status === "loading") {
    return <p className="text-center mt-20">Зарежда...</p>;
  }

  return (
    <>
      {/* HomeHero е най-отгоре */}
      <HomeHero />

      {/* BannerVideo е вторият елемент */}
      <BannerVideo
        cloudName={cloudName}
        publicId="xartify/banner-home"
        posterPublicId="banner-home-poster"
        revealOnTap
      />

      {/* CoursesAdv секция */}
      <CoursesAdv
        title="500K"
        subtitle="най-голямата и активна образователна общност в България"
        image1Url="/test.jpg"
        image2Url="/test2.jpg"
        buttonUrl="/courses"
        buttonText="ЗАПИШИ СЕ СЕГА"
      />

      {/* Останалият контент */}
      <div className="text-center">
        {session ? (
          <>
            <h1 className="text-2xl font-bold">Здравей, {session.user?.name || session.user?.email}</h1>
            <p>Ти си логнат като: {session.user?.email}</p>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Изход
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Добре дошъл в xArtify</h1>
            <p>Моля, влез в акаунта си или се регистрирай.</p>
            <div className="flex justify-center gap-4">
              <Link
                href="/login"
                className="bg-transparent text-gray-100 text-xl hover:bg-primary hover:text-black active:bg-primary active:text-black px-5 py-2 rounded-full ring-2 ring-neutral-800/20"
              >
                Вход
              </Link>

              <a
                href="/register"
                className="bg-transparent text-gray-100 text-xl hover:bg-primary hover:text-black active:bg-primary active:text-black px-5 py-2 rounded-full ring-2 ring-neutral-800/20"
              >
                Регистрация
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}
