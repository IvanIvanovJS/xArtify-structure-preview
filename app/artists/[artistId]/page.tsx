import { prisma } from "@/lib/prisma";
import ArtistProfileClient from "@/components/artists/ArtistProfileClient/ArtistProfileClient";
import { notFound } from "next/navigation";

export const runtime = "nodejs";

interface ArtistProfilePageProps {
    params: Promise<{ artistId: string }>;
}

export default async function ArtistProfilePage({ params }: ArtistProfilePageProps) {
    const { artistId } = await params;

    const artist = await prisma.artistProfile.findUnique({
        where: { id: artistId },
        include: {
            user: {
                select: {
                    name: true,
                    image: true
                }
            },
            paintings: {
                orderBy: { createdAt: "desc" },
                where: {
                    isSold: false
                }
            },
            tags: true,
            faqs: {
                orderBy: { createdAt: "desc" }
            }
        },
    });

    // Add artist property to each painting for type compatibility
    if (artist) {
        artist.paintings = artist.paintings.map(painting => ({
            ...painting,
            artist: {
                id: artist.id,
                user: {
                    name: artist.user.name
                }
            }
        }));
    }

    if (!artist) {
        notFound();
    }

    return <ArtistProfileClient artist={artist} />;
}