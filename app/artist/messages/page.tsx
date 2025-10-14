// app/artist/messages/page.tsx
import { type Metadata } from "next";
import { JSX } from "react";
import ArtistMessages from "@/components/artist/ArtistMessages/ArtistMessages";

export const metadata: Metadata = {
    title: "Съобщения - Артист Портал",
    description: "Комуникация с клиенти и съобщения",
};

export default function MessagesPage(): JSX.Element {
    return <ArtistMessages />;
}
