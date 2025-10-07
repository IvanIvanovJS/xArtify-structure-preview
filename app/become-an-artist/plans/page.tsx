import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SubscriptionPlansPageComponent from "@/components/becomeAnArtist/SubscriptionPlansPage";

export const runtime = "nodejs";

export default async function SubscriptionPlansPage() {
    const session = await getServerSession(authOptions);

    // Get subscription plans from database (public information)
    const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { monthlyPrice: 'asc' }
    });

    // If user is logged in, check if they already have artist profile
    if (session?.user?.id) {
        const existingProfile = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id },
            select: { id: true, userId: true }
        });

        if (existingProfile) {
            redirect(`/artists/${existingProfile.id}`);
        }
    }

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <SubscriptionPlansPageComponent
                plans={plans}
                userId={session?.user?.id || ''}
            />
        </div>
    );
}
