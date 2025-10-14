// app/artist/layout.tsx
import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { JSX } from "react";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import ArtistLayoutClient from "@/components/artist/ArtistLayout/ArtistLayoutClient";

export const metadata: Metadata = {
    title: "Артист Портал - xArtify",
    description: "Управление на профил, картини, курсове и аналитика",
};

interface ArtistLayoutProps {
    children: React.ReactNode;
}

export default async function ArtistLayout({ children }: ArtistLayoutProps): Promise<JSX.Element> {
    // Authentication check
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/auth/signin");
    }

    // Get artist profile
    const artistProfile = await prisma.artistProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            user: true,
            subscription: {
                include: { plan: true }
            }
        }
    });

    if (!artistProfile) {
        redirect("/become-an-artist");
    }

    // Get unread message count
    const unreadCount = await prisma.conversation.aggregate({
        where: {
            artistId: artistProfile.id,
            artistUnreadCount: { gt: 0 }
        },
        _sum: { artistUnreadCount: true }
    });

    const totalUnreadMessages = unreadCount._sum.artistUnreadCount || 0;

    return (
        <ArtistLayoutClient
            artistProfile={artistProfile}
            unreadMessageCount={totalUnreadMessages}
        >
            {children}
        </ArtistLayoutClient>
    );
}
