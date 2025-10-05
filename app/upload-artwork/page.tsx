import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import UploadArtwork from '@/components/uploadArtwork/UploadArtwork';

export const runtime = 'nodejs';

export const metadata: Metadata = {
    title: 'Качи картина | xArtify',
    description: 'Сподели творбите си с света и присъедини се към нашата общност от художници',
    openGraph: {
        title: 'Качи картина | xArtify',
        description: 'Сподели творбите си с света и присъедини се към нашата общност от художници',
    },
};

export default async function UploadArtworkPage(): Promise<React.JSX.Element> {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user?.id) {
        redirect('/login?callbackUrl=/upload-artwork');
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Check if user has artist profile or is admin
    const artistProfile = await prisma.artistProfile.findUnique({
        where: { userId },
        select: { id: true },
    });

    const isAuthorized = artistProfile || userRole === 'ADMIN';

    if (!isAuthorized) {
        redirect('/become-an-artist?message=artist-profile-required');
    }

    return <UploadArtwork />;
}
