// app/create-painting/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import CreatePaintingForm from '@/components/UploadArtwork'; // Ще създадем този компонент

const prisma = new PrismaClient();

// Server Component за проверка на правата
export default async function CreatePaintingPage() {
    const session = await getServerSession(authOptions);

    // 1. Проверка дали потребителят е влязъл
    if (!session || !session.user || !session.user.id) {
        redirect('/'); // Пренасочваме към начална страница
    }

    const userId = session.user.id;

    // 2. Проверка дали потребителят има профил на артист
    const artistProfile = await prisma.artistProfile.findUnique({
        where: { userId },
    });

    if (!artistProfile) {
        // Пренасочваме към страницата за създаване на артист профил
        redirect('/create-artist-profile');
    }

    // Ако всички проверки са успешни, рендираме формата за създаване
    return (
        <div className="flex bg-transparent items-center justify-center min-h-screen p-8">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-3xl font-bold text-center font-serif mb-6 text-gray-800">Добавяне на нова картина</h2>
                <CreatePaintingForm artistId={userId} />
            </div>
        </div>
    );
}
