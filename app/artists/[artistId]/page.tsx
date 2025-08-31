// app/artists/[artistId]/page.tsx
import { bgnToEur } from '@/lib/currency';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

type Params = { artistId: string };

export default async function ArtistProfilePage(
    { params }: { params: Promise<Params> }  // ⬅️ точно това иска типът PageProps при теб
) {
    const { artistId } = await params;

    const artist = await prisma.artistProfile.findUnique({
        where: { id: artistId },
        include: {
            user: { select: { name: true, image: true } },
            paintings: { orderBy: { createdAt: "desc" } },
        },
    });

    // Ако не намерим артист, показваме страница за грешка
    if (!artist) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">Артистът не е намерен</h1>
                <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">Върнете се в <Link href="/" className="text-blue-500 hover:underline">галерията</Link>.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            {/* Профил на артиста */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8 flex flex-col md:flex-row items-center">
                <div className="relative w-40 h-40 rounded-full overflow-hidden mr-8">
                    <Image
                        src={artist.user.image || "/placeholder-avatar.jpg"}
                        alt={artist.user.name || "Профилна снимка"}
                        fill // replaces layout="fill"
                        style={{ objectFit: "cover" }}
                    />
                </div>
                <div className="text-center md:text-left mt-4 md:mt-0">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">{artist.user.name}</h1>
                    {artist.bio && (
                        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-xl">{artist.bio}</p>
                    )}
                </div>
            </div>

            {/* Галерия с картините на артиста */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Галерия на {artist.user.name}</h2>
                {artist.paintings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {artist.paintings.map((painting) => (
                            <div key={painting.id} className="bg-white rounded-lg w-64 shadow-md overflow-hidden">
                                <Link href={`/gallery/${painting.id}`}>
                                    <div>
                                        <div className="relative w-64 h-64 overflow-hidden group">
                                            {/* Първа снимка */}
                                            <Image
                                                src={painting.images[0]}
                                                alt={painting.title}
                                                fill // replaces layout="fill"
                                                style={{ objectFit: "cover" }}
                                                className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                                            />
                                            {/* Втора снимка */}
                                            <Image
                                                src={painting.images[1]}
                                                alt={painting.title}
                                                fill // replaces layout="fill"
                                                style={{ objectFit: "cover" }}
                                                className="object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-xl font-semibold text-gray-800">{painting.title}</h3>
                                            <p className="mt-2 text-lg font-bold text-gray-900">{painting.price.toFixed(2)} лв.</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{bgnToEur(painting.price).toFixed(2)} €</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600 dark:text-gray-400">Този артист все още няма качени картини.</p>
                )}
            </div>
        </div>
    );
}
