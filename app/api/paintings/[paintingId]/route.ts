// app/api/paintings/[paintingId]/route.ts
// Fix: Use the correct Route Handler signature for Next.js App Router
// (req: Request, context: { params: { ... } }) and Node runtime for Prisma/Cloudinary

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs"; // Prisma/Cloudinary require Node, not Edge

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// PUT /api/paintings/[paintingId] — update painting (multipart/form-data)
export async function PUT(req: Request, context: { params: { paintingId: string } }) {
    const session = await getServerSession(authOptions);
    const { paintingId } = context.params;

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();

        const paintingDataString = formData.get("paintingData");
        if (typeof paintingDataString !== "string") {
            return NextResponse.json({ message: "Invalid payload (paintingData missing)" }, { status: 400 });
        }

        const paintingData = JSON.parse(paintingDataString) as {
            title?: string;
            dimensions?: string;
            materials?: string;
            description?: string;
            price?: string | number;
            images?: string[];
        };

        const { title, dimensions, materials, description } = paintingData;
        const price = typeof paintingData.price === "string" ? parseFloat(paintingData.price) : paintingData.price ?? 0;
        const images = Array.isArray(paintingData.images) ? paintingData.images : [];

        // Check ownership
        const painting = await prisma.painting.findUnique({
            where: { id: paintingId },
            include: { artist: true },
        });

        if (!painting || painting.artist?.userId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Upload any new images from multipart field "newImages"
        const newImageFiles = formData.getAll("newImages");
        const uploadedImageUrls: string[] = [];

        for (const entry of newImageFiles) {
            if (entry instanceof File) {
                const buffer = Buffer.from(await entry.arrayBuffer());
                const secureUrl: string = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: "image", folder: "art-gallery", overwrite: false, unique_filename: true },
                        (err, result) => (err ? reject(err) : resolve(result!.secure_url))
                    );
                    stream.end(buffer);
                });
                uploadedImageUrls.push(secureUrl);
            }
        }

        const updatedImages = [...images, ...uploadedImageUrls];

        const updated = await prisma.painting.update({
            where: { id: paintingId },
            data: { title, dimensions, materials, description, price, images: updatedImages },
        });

        return NextResponse.json({ item: updated }, { status: 200 });
    } catch (error) {
        console.error("Error updating painting:", error);
        return NextResponse.json({ message: "Error updating painting" }, { status: 500 });
    }
}

// DELETE /api/paintings/[paintingId]
export async function DELETE(_req: Request, context: { params: { paintingId: string } }) {
    const session = await getServerSession(authOptions);
    const { paintingId } = context.params;

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const painting = await prisma.painting.findUnique({
            where: { id: paintingId },
            include: { artist: true },
        });

        if (!painting || painting.artist?.userId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await prisma.painting.delete({ where: { id: paintingId } });
        return NextResponse.json({ message: "Painting successfully deleted" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting painting:", error);
        return NextResponse.json({ message: "Error deleting painting" }, { status: 500 });
    }
}
