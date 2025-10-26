import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SubscriptionManagementClient from "@/components/my-profile/SubscriptionManagementClient";

export const runtime = "nodejs";

export default async function SubscriptionManagementPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        redirect('/login');
    }

    // Get user's artist profile and subscription
    const artistProfile = await prisma.artistProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            subscription: {
                include: {
                    plan: true
                }
            }
        }
    });

    if (!artistProfile) {
        redirect('/become-an-artist/plans');
    }

    // Get all available plans
    const availablePlans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { monthlyPrice: 'asc' }
    });

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <SubscriptionManagementClient
                currentSubscription={artistProfile.subscription}
                availablePlans={availablePlans}
            />
        </div>
    );
}
