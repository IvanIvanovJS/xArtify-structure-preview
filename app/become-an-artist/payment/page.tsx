import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PaymentPageClient from "@/components/becomeAnArtist/PaymentPageClient";

export const runtime = "nodejs";

interface PaymentPageProps {
    searchParams: Promise<{
        artistId?: string;
        planId?: string;
    }>;
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        redirect('/login');
    }

    const resolvedSearchParams = await searchParams;
    const { artistId, planId } = resolvedSearchParams;

    if (!artistId || !planId) {
        redirect('/become-an-artist/plans');
    }

    // Get artist profile and plan details
    const [artistProfile, plan] = await Promise.all([
        prisma.artistProfile.findUnique({
            where: { id: artistId },
            include: { user: true }
        }),
        prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        })
    ]);

    if (!artistProfile || !plan) {
        redirect('/become-an-artist/plans');
    }

    // Check if user owns this artist profile
    if (artistProfile.userId !== session.user.id) {
        redirect('/become-an-artist/plans');
    }

    // Check if artist already has a subscription
    const existingSubscription = await prisma.artistSubscription.findUnique({
        where: { artistId }
    });

    if (existingSubscription) {
        redirect(`/artists/${artistId}`);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="container mx-auto px-4 py-8">
                <PaymentPageClient
                    artistProfile={artistProfile}
                    plan={plan}
                    userId={session.user.id}
                />
            </div>
        </div>
    );
}

