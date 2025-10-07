import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PaymentPageClient from "@/components/becomeAnArtist/PaymentPageClient";

export const runtime = "nodejs";

interface PaymentPageProps {
    searchParams: Promise<{
        planId?: string;
    }>;
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        redirect('/login');
    }

    const resolvedSearchParams = await searchParams;
    const { planId } = resolvedSearchParams;

    if (!planId) {
        redirect('/become-an-artist/plans');
    }

    // Get plan details
    const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId }
    });

    if (!plan) {
        redirect('/become-an-artist/plans');
    }

    // Check if user already has artist profile
    const existingProfile = await prisma.artistProfile.findUnique({
        where: { userId: session.user.id }
    });

    if (existingProfile) {
        redirect(`/artists/${existingProfile.id}`);
    }

    return (

        <div className="container mx-auto px-4 py-8">
            <PaymentPageClient
                plan={plan}
                userId={session.user.id}
            />
        </div>

    );
}

