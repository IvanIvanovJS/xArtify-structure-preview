import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { limiterAuth, rateKey } from "@/lib/rateLimit";

const DeleteAccountSchema = z.object({
    password: z.string().min(1, "Паролата е задължителна за потвърждение")
});

export async function DELETE(req: NextRequest): Promise<NextResponse> {
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
        const { success } = await limiterAuth.limit(rateKey(req, session.user.id));
        if (!success) {
            return NextResponse.json(
                { message: "Твърде много заявки. Моля опитайте отново по-късно." },
                { status: 429 }
            );
        }

        const body = await req.json();

        // Validate input
        const validatedData = DeleteAccountSchema.parse(body);
        const { password } = validatedData;

        // Get current user data
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                password: true,
                role: true,
                image: true
            }
        });

        if (!currentUser) {
            return NextResponse.json(
                { message: "Потребителят не е намерен" },
                { status: 404 }
            );
        }

        // Prevent admin account deletion
        if (currentUser.role === "ADMIN") {
            return NextResponse.json(
                { message: "Администраторските акаунти не могат да бъдат изтривани" },
                { status: 403 }
            );
        }

        // Verify password
        if (!currentUser.password) {
            return NextResponse.json(
                { message: "Не можете да изтриете този акаунт" },
                { status: 400 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, currentUser.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Невалидна парола" },
                { status: 400 }
            );
        }

        // Delete user image if it exists and is not the default avatar
        if (currentUser.image && !currentUser.image.includes("default-avatar")) {
            try {
                const { unlink } = await import("fs/promises");
                const { join } = await import("path");
                const imagePath = join(process.cwd(), "public", currentUser.image);
                await unlink(imagePath);
            } catch (error) {
                console.warn("Could not delete user image:", error);
                // Don't fail the request if we can't delete the image
            }
        }

        // Delete user (this will cascade delete related records due to onDelete: Cascade)
        await prisma.user.delete({
            where: { id: session.user.id }
        });

        return NextResponse.json({
            message: "Акаунтът е изтрит успешно"
        });

    } catch (error) {
        console.error("Account deletion error:", error);

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
            { message: "Възникна грешка при изтриване на акаунта" },
            { status: 500 }
        );
    }
}
