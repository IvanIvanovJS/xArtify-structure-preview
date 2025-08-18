// app/paintings/edit/[paintingId]/page.tsx
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import EditPaintingForm from '@/components/EditPaintingForm';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export default async function EditPaintingPage({ params }: { params: { paintingId: string } }) {
    const { paintingId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
        notFound();
    }

    const painting = await prisma.painting.findUnique({
        where: { id: paintingId },
        include: {
            artist: {
                select: {
                    userId: true,
                },
            },
        },
    });

    if (!painting || painting.artist.userId !== session.user.id) {
        notFound();
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8">Редактиране на картина</h1>
            <div className="max-w-xl mx-auto">
                <EditPaintingForm painting={painting} />
            </div>
        </div>
    );
}
