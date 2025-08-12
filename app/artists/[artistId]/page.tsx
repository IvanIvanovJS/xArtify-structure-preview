// app/artists/[artistId]/page.tsx
import { PrismaClient } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

const prisma = new PrismaClient();

// Компонент, който ще се изпълнява на сървъра
export default async function ArtistProfilePage({ params }: { params: { artistId: string } }) {
    const { artistId } = await params;

    // Извличане на профила на артиста и неговите картини от базата данни
    const artist = await prisma.artistProfile.findUnique({
        where: { id: artistId },
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                },
            },
            paintings: {
                orderBy: {
                    createdAt: 'desc', // Сортираме картините по дата на създаване
                },
            },
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
                        layout="fill"
                        objectFit="cover"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {artist.paintings.map((painting) => (
                            <div key={painting.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <Link href={`/paintings/${painting.id}`}>
                                    <div className="relative w-full h-64">
                                        <Image
                                            src={painting.images[0] || "/placeholder.jpg"}
                                            alt={painting.title}
                                            layout="fill"
                                            objectFit="cover"
                                            className="hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-xl font-semibold text-gray-800">{painting.title}</h3>
                                        <p className="mt-2 text-lg font-bold text-gray-900">{painting.price.toFixed(2)} лв.</p>
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
