// app/artist/artworks/page.tsx
import { type Metadata } from "next";
import { JSX } from "react";
import ArtworkManagement from "@/components/artist/ArtworkManagement/ArtworkManagement";

export const metadata: Metadata = {
    title: "Управление на Картини - Артист Портал",
    description: "Създаване, редактиране и управление на картини",
};

export default function ArtworksPage(): JSX.Element {
    return <ArtworkManagement />;
}
