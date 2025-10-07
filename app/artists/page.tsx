// app/artists/page.tsx
import { prisma } from "@/lib/prisma";
import ArtistsClient from "@/components/artists/ArtistsClient";

export const runtime = "nodejs";

// Компонентът се изпълнява на сървъра
export default async function AllArtistsPage() {
    // Извличаме всички профили на артисти от базата данни
    const artists = await prisma.artistProfile.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
        orderBy: {
            user: {
                name: 'asc', // Сортираме артистите по азбучен ред
            },
        },
    });

    return <ArtistsClient artists={artists} />;
}
