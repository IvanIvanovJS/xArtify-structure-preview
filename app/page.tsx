"use client";

import { useSession } from "next-auth/react";
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
        buttonUrl="/courses"
        buttonText="Научи повече"
      />


    </>
  );
}
