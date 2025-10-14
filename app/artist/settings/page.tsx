// app/artist/settings/page.tsx
import { type Metadata } from "next";
import { JSX } from "react";
import ArtistSettings from "@/components/artist/ArtistSettings/ArtistSettings";

export const metadata: Metadata = {
    title: "Настройки - Артист Портал",
    description: "Управление на профил, FAQ и настройки",
};

export default function SettingsPage(): JSX.Element {
    return <ArtistSettings />;
}
