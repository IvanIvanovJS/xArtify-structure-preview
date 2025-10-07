import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArtistProfileForm from "@/components/becomeAnArtist/ArtistProfileForm";

export const runtime = "nodejs";

interface FormPageProps {
    searchParams: Promise<{
        planId?: string;
        paymentIntentId?: string;
    }>;
}

export default async function ArtistFormPage({ searchParams }: FormPageProps) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        redirect('/login');
    }

    // Check if user already has artist profile
    const existingProfile = await prisma.artistProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true, userId: true }
    });

    if (existingProfile) {
        redirect(`/artists/${existingProfile.id}`);
    }

    // Get the selected plan and payment info
    const resolvedSearchParams = await searchParams;
    const { planId, paymentIntentId } = resolvedSearchParams;
    let selectedPlan = null;
    let paymentInfo = null;

    if (planId) {
        selectedPlan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        });
    }

    if (paymentIntentId) {
        paymentInfo = await prisma.paymentIntent.findUnique({
            where: { id: paymentIntentId }
        });
    }

    // Get user data for pre-filling
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            email: true,
            image: true
        }
    });

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Създайте профила си на артист
                </h1>
                <p className="text-xl text-gray-300">
                    Попълнете информацията по-долу, за да започнете да продавате своите творби
                </p>
            </div>

            <ArtistProfileForm
                userId={session.user.id}
                userData={user}
                selectedPlan={selectedPlan}
                paymentInfo={paymentInfo}
            />
        </div>
    );
}

