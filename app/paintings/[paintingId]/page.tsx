// app/paintings/[paintingId]/page.tsx
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Image from 'next/image';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function PaintingDetailsPage({ params }: { params: { paintingId: string } }) {
    const { paintingId } = await params;
    const session = await getServerSession(authOptions);

    const painting = await prisma.painting.findUnique({
        where: { id: paintingId },
        include: {
            artist: {
                select: {
                    id: true,
                    userId: true, // Добавяме userId за проверка на собствеността
                    user: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });

    if (!painting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">Картината не е намерена</h1>
                <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">Върнете се в <Link href="/" className="text-blue-500 hover:underline">галерията</Link>.</p>
            </div>
        );
    }

    // Проверяваме дали потребителят е собственик на картината
    const isOwner = session && session.user.id === painting.artist.userId;

    return (
        <div className="container mx-auto p-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Снимки на картината */}
                    <div className="flex-1">
                        <div className="relative w-full h-96 rounded-lg overflow-hidden">
                            <Image
                                src={painting.images[0] || "/placeholder.jpg"}
                                alt={painting.title}
                                layout="fill"
                                objectFit="contain"
                            />
                        </div>
                        {/* Миниатюри */}
                        {painting.images.length > 1 && (
                            <div className="flex gap-4 mt-4 overflow-x-auto">
                                {painting.images.map((image, index) => (
                                    <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer flex-shrink-0">
                                        <Image
                                            src={image}
                                            alt={`Снимка ${index + 1} на ${painting.title}`}
                                            layout="fill"
                                            objectFit="cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Детайли и бутони */}
                    <div className="flex-1 md:ml-8">
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">{painting.title}</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                            от{" "}
                            <Link href={`/artists/${painting.artist.id}`} className="text-blue-500 hover:underline">
                                {painting.artist.user.name}
                            </Link>
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">{painting.price.toFixed(2)} лв.</p>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Описание</h3>
                            <p className="text-gray-700 dark:text-gray-300">{painting.description}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Технически детайли</h3>
                            <ul className="text-gray-700 dark:text-gray-300 list-disc list-inside">
                                {painting.dimensions && <li>**Размери:** {painting.dimensions}</li>}
                                {painting.materials && <li>**Материали:** {painting.materials}</li>}
                            </ul>
                        </div>

                        {/* Бутон за действие */}
                        {isOwner ? (
                            <Link href={`/paintings/edit/${painting.id}`}>
                                <button className="w-full bg-blue-500 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-blue-600 transition-colors">
                                    Редактирай картина
                                </button>
                            </Link>
                        ) : (
                            <button className="w-full bg-green-500 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-green-600 transition-colors">
                                Купи
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
