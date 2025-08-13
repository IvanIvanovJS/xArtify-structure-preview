// app/artists/page.tsx
import { PrismaClient } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

// Създаваме нов екземпляр на PrismaClient
const prisma = new PrismaClient();

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

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-8">Всички артисти</h1>

            {artists.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {artists.map((artist) => (
                        <Link key={artist.id} href={`/artists/${artist.id}`} className="group block">
                            <div className="flex flex-col items-center text-center">
                                {/* Профилна снимка */}
                                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                    <Image
                                        src={artist.user.image || "/placeholder-avatar.jpg"}
                                        alt={artist.user.name || "Профилна снимка"}
                                        layout="fill"
                                        objectFit="cover"
                                        className="group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                {/* Име на артиста */}
                                <p className="mt-2 text-md font-semibold text-gray-800 dark:text-gray-200 group-hover:underline">
                                    {artist.user.name}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-600 dark:text-gray-400 text-xl">
                    Все още няма регистрирани артисти.
                </div>
            )}
        </div>
    );
}
