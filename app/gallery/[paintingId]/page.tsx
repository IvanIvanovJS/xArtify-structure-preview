// app/gallery/[paintingId]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import PaintingDetailPage from "@/components/artworkGallery/PaintingDetailPage";
import { notFound } from "next/navigation";

export const runtime = "nodejs";

export default async function GalleryPaintingPage({ params }: { params: Promise<{ paintingId: string }> }) {
    const { paintingId } = await params;
    const session = await getServerSession(authOptions);

    // Try to find by urlTitle first, then by id as fallback
    const painting = await prisma.painting.findFirst({
        where: {
            OR: [
                { urlTitle: { equals: paintingId } },
                { id: paintingId }
            ]
        },
        include: {
            artist: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });



    if (!painting) {
        notFound();
    }

    const isOwner = session && session.user.id === painting.artist.userId;

    return (
        <PaintingDetailPage
            painting={painting}
            isOwner={!!isOwner}
        />
    );
}
