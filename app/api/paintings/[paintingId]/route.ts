// app/api/paintings/[paintingId]/route.ts
// ✅ Fix: WIDEN the second argument type to match Next.js expectations
// This version compiles on Next 14/15 by using the Next.js standard types.

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { v2 as cloudinary } from "cloudinary";
import { generateUrlTitle } from "@/lib/slug";

export const runtime = "nodejs"; // Prisma/Cloudinary need Node runtime

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Helper to extract and assert the id from the context
function getPaintingId(ctx: { params: { paintingId: string | string[] } }) {
    const val = ctx.params.paintingId;
    if (Array.isArray(val)) return val[0];
    return val;
}

// PUT /api/paintings/[paintingId]
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const urlParts = req.url.split('/');
    const paintingId = urlParts[urlParts.length - 1];
    const paintingIdValue = getPaintingId({ params: { paintingId } });

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();

        const paintingDataRaw = formData.get("paintingData");
        if (typeof paintingDataRaw !== "string") {
            return NextResponse.json({ message: "Invalid payload (paintingData missing)" }, { status: 400 });
        }

        const paintingData = JSON.parse(paintingDataRaw) as {
            title?: string;
            urlTitle?: string;
            dimensions?: string;
            materials?: string;
            description?: string;
            price?: string | number;
            images?: string[];
        };

        const price = typeof paintingData.price === "string" ? parseFloat(paintingData.price) : paintingData.price ?? 0;
        const images = Array.isArray(paintingData.images) ? paintingData.images : [];

        // ownership check - allow if user owns the painting or is admin
        const painting = await prisma.painting.findUnique({
            where: { id: paintingIdValue },
            include: { artist: { include: { user: true } } }
        });

        if (!painting) {
            return NextResponse.json({ message: "Painting not found" }, { status: 404 });
        }

        const isOwner = painting.artist?.userId === session.user.id;
        const isAdmin = session.user.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // upload new images (multipart field: newImages)
        const newFiles = formData.getAll("newImages");
        const uploaded: string[] = [];
        for (const entry of newFiles) {
            if (entry instanceof File) {
                const buffer = Buffer.from(await entry.arrayBuffer());
                const url: string = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: "image", folder: "art-gallery", overwrite: false, unique_filename: true },
                        (err, result) => (err ? reject(err) : resolve(result!.secure_url))
                    );
                    stream.end(buffer);
                });
                uploaded.push(url);
            }
        }

        // Generate new URL title if title or urlTitle changed
        let urlTitle = painting.urlTitle;
        const titleChanged = paintingData.title && paintingData.title !== painting.title;
        const urlTitleChanged = paintingData.urlTitle && paintingData.urlTitle !== painting.urlTitle;

        if (titleChanged || urlTitleChanged) {
            // Use urlTitle field if provided, otherwise use title
            const sourceText = paintingData.urlTitle || paintingData.title || painting.title;
            urlTitle = generateUrlTitle(sourceText, paintingIdValue);

            // Check if new urlTitle already exists
            let uniqueUrlTitle = urlTitle;
            let urlCounter = 1;
            while (await prisma.painting.findUnique({ where: { urlTitle: uniqueUrlTitle } })) {
                uniqueUrlTitle = `${urlTitle.split('-').slice(0, -1).join('-')}-${urlCounter}`;
                urlCounter++;
            }
            urlTitle = uniqueUrlTitle;
        }

        const updated = await prisma.painting.update({
            where: { id: paintingIdValue },
            data: {
                title: paintingData.title,
                urlTitle: urlTitle,
                dimensions: paintingData.dimensions,
                materials: paintingData.materials,
                description: paintingData.description,
                price,
                images: [...images, ...uploaded],
            },
        });

        return NextResponse.json({ item: updated }, { status: 200 });
    } catch (err) {
        console.error("Error updating painting:", err);
        return NextResponse.json({ message: "Error updating painting" }, { status: 500 });
    }
}

// DELETE /api/paintings/[paintingId]
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const paintingId = req.nextUrl.pathname.split('/').pop() as string;

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const painting = await prisma.painting.findUnique({
            where: { id: paintingId },
            include: { artist: { include: { user: true } } }
        });

        if (!painting) {
            return NextResponse.json({ message: "Painting not found" }, { status: 404 });
        }

        const isOwner = painting.artist?.userId === session.user.id;
        const isAdmin = session.user.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await prisma.painting.delete({ where: { id: paintingId } });
        return NextResponse.json({ message: "Painting successfully deleted" }, { status: 200 });
    } catch (err) {
        console.error("Error deleting painting:", err);
        return NextResponse.json({ message: "Error deleting painting" }, { status: 500 });
    }
}
