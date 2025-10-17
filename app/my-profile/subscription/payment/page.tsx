import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SubscriptionPaymentClient from "@/components/my-profile/SubscriptionPaymentClient";

export const runtime = "nodejs";

interface SubscriptionPaymentPageProps {
    searchParams: Promise<{
        planId?: string;
        subscriptionId?: string;
        isDowngrade?: string;
    }>;
}

export default async function SubscriptionPaymentPage({ searchParams }: SubscriptionPaymentPageProps) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        redirect('/login');
    }

    const resolvedSearchParams = await searchParams;
    const { planId, subscriptionId, isDowngrade } = resolvedSearchParams;

    if (!planId) {
        redirect('/my-profile/subscription');
    }

    // For downgrades, subscriptionId is not required
    if (!isDowngrade && !subscriptionId) {
        redirect('/my-profile/subscription');
    }

    // Get plan details
    const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId }
    });

    if (!plan) {
        redirect('/my-profile/subscription');
    }

    // Get user's current subscription
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

    if (!artistProfile || !artistProfile.subscription) {
        redirect('/my-profile/subscription');
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <SubscriptionPaymentClient
                plan={plan}
                currentSubscription={artistProfile.subscription}
                subscriptionId={subscriptionId || ''}
                userId={session.user.id}
                isDowngrade={isDowngrade === 'true'}
            />
        </div>
    );
}
