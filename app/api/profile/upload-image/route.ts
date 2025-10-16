import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { limiterHeavy, rateKey } from "@/lib/rateLimit";

export async function POST(req: NextRequest): Promise<NextResponse> {
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
        const { success } = await limiterHeavy.limit(rateKey(req, session.user.id));
        if (!success) {
            return NextResponse.json(
                { message: "Твърде много заявки. Моля опитайте отново по-късно." },
                { status: 429 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("image") as File;

        if (!file) {
            return NextResponse.json(
                { message: "Няма избран файл" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { message: "Файлът трябва да бъде изображение" },
                { status: 400 }
            );
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { message: "Файлът трябва да бъде по-малък от 5MB" },
                { status: 400 }
            );
        }

        // Generate unique filename
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${uuidv4()}.${fileExtension}`;

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), "public", "uploads", "avatars");

        try {
            await writeFile(join(uploadsDir, fileName), Buffer.from(await file.arrayBuffer()));
        } catch (error) {
            // If directory doesn't exist, create it
            const { mkdir } = await import("fs/promises");
            await mkdir(uploadsDir, { recursive: true });
            await writeFile(join(uploadsDir, fileName), Buffer.from(await file.arrayBuffer()));
        }

        // Get current user to delete old image
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { image: true }
        });

        // Update user with new image path
        const imagePath = `/uploads/avatars/${fileName}`;
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                image: imagePath,
                updatedAt: new Date()
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                updatedAt: true
            }
        });

        // Delete old image if it exists and is not the default avatar
        if (currentUser?.image && !currentUser.image.includes("default-avatar")) {
            try {
                const oldImagePath = join(process.cwd(), "public", currentUser.image);
                await unlink(oldImagePath);
            } catch (error) {
                console.warn("Could not delete old image:", error);
                // Don't fail the request if we can't delete the old image
            }
        }

        return NextResponse.json({
            message: "Снимката е качена успешно",
            imagePath: imagePath,
            user: updatedUser
        });

    } catch (error) {
        console.error("Image upload error:", error);

        return NextResponse.json(
            { message: "Възникна грешка при качване на изображението" },
            { status: 500 }
        );
    }
}
