import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { planId, billingCycle, isDowngrade } = await req.json();

        if (!planId || !billingCycle) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Get user's artist profile and current subscription
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
            return NextResponse.json({ message: "No active subscription found" }, { status: 404 });
        }

        // Get the new plan
        const newPlan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        });

        if (!newPlan) {
            return NextResponse.json({ message: "Plan not found" }, { status: 404 });
        }

        // Update subscription with transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update the subscription
            const updatedSubscription = await tx.artistSubscription.update({
                where: { id: artistProfile.subscription!.id },
                data: {
                    planId: newPlan.id,
                    billingCycle: billingCycle,
                    status: 'active',
                    updatedAt: new Date()
                },
                include: {
                    plan: true
                }
            });

            return updatedSubscription;
        });

        return NextResponse.json({
            message: "Plan changed successfully",
            subscription: result
        });

    } catch (error) {
        console.error("Plan change error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
