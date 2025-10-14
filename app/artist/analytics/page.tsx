// app/artist/analytics/page.tsx
import { type Metadata } from "next";
import { JSX } from "react";
import ArtistAnalytics from "@/components/artist/ArtistAnalytics/ArtistAnalytics";

export const metadata: Metadata = {
    title: "Аналитика - Артист Портал",
    description: "Преглед на продажби, прегледи и статистики",
};

export default function AnalyticsPage(): JSX.Element {
    return <ArtistAnalytics />;
}
