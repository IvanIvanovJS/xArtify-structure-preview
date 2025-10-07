import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { limiter10perMin, rateKey } from "@/lib/rateLimit";

const UpdateProfileSchema = z.object({
    name: z.string().min(1, "Името е задължително").max(100, "Името е твърде дълго"),
    email: z.string().email("Невалиден имейл адрес").max(255, "Имейлът е твърде дълъг"),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "Паролата трябва да бъде поне 6 символа").optional()
}).refine((data) => {
    // If newPassword is provided, currentPassword must also be provided
    if (data.newPassword && !data.currentPassword) {
        return false;
    }
    return true;
}, {
    message: "Текущата парола е задължителна при смяна на паролата",
    path: ["currentPassword"]
});

export async function PUT(req: NextRequest): Promise<NextResponse> {
    try {
        // Check authentication first
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Не сте влезли в системата" },
                { status: 401 }
            );
        }

        // Rate limiting
        const { success } = await limiter10perMin.limit(rateKey(req, session.user.id));
        if (!success) {
            return NextResponse.json(
                { message: "Твърде много заявки. Моля опитайте отново по-късно." },
                { status: 429 }
            );
        }

        const body = await req.json();

        // Validate input
        const validatedData = UpdateProfileSchema.parse(body);
        const { name, email, currentPassword, newPassword } = validatedData;

        // Check if email is already taken by another user
        const existingUser = await prisma.user.findFirst({
            where: {
                email: email,
                id: { not: session.user.id }
            }
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Този имейл адрес вече се използва" },
                { status: 400 }
            );
        }

        // Get current user data
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { password: true }
        });

        if (!currentUser) {
            return NextResponse.json(
                { message: "Потребителят не е намерен" },
                { status: 404 }
            );
        }

        // If password change is requested, verify current password
        if (newPassword && currentPassword) {
            if (!currentUser.password) {
                return NextResponse.json(
                    { message: "Не можете да смените паролата за този акаунт" },
                    { status: 400 }
                );
            }

            const isCurrentPasswordValid = await bcrypt.compare(
                currentPassword,
                currentUser.password
            );

            if (!isCurrentPasswordValid) {
                return NextResponse.json(
                    { message: "Невалидна текуща парола" },
                    { status: 400 }
                );
            }
        }

        // Prepare update data
        const updateData: {
            name: string;
            email: string;
            password?: string;
            updatedAt: Date;
        } = {
            name,
            email,
            updatedAt: new Date()
        };

        // Hash new password if provided
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            updateData.password = hashedPassword;
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                updatedAt: true
            }
        });

        return NextResponse.json({
            message: "Профилът е обновен успешно",
            user: updatedUser
        });

    } catch (error) {
        console.error("Profile update error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    message: "Невалидни данни",
                    errors: error.issues.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Възникна грешка при обновяване на профила" },
            { status: 500 }
        );
    }
}
