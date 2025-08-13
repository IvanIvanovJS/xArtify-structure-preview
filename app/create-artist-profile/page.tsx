// app/create-artist-profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CreateArtistProfileForm from "@/components/CreateArtistProfileForm";

export default async function CreateArtistProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        // Предотвратяваме достъп, ако потребителят не е автентикиран.
        redirect('/login')
    }

    // Проверяваме дали потребителят вече има профил на артист.
    const existingProfile = await prisma.artistProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (existingProfile) {
        // Ако профилът вече съществува, пренасочваме потребителя към неговата страница.
        redirect(`/artists/${existingProfile.id}`);
    }

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-8">
                Създаване на профил на артист
            </h1>
            <div className="max-w-xl mx-auto">
                <CreateArtistProfileForm userId={session.user.id} />
            </div>
        </div>
    );
}
