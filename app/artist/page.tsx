// app/artist/page.tsx
import { type Metadata } from "next";
import { JSX } from "react";
import ArtistDashboard from "@/components/artist/ArtistDashboard/ArtistDashboard";

export const metadata: Metadata = {
    title: "Dashboard - Артист Портал",
    description: "Преглед на картини, продажби и аналитика",
};

export default function ArtistDashboardPage(): JSX.Element {
    return <ArtistDashboard />;
}
