// app/api/paintings/[paintingId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// PUT /api/paintings/[paintingId] - Редактиране на картина
export async function PUT(req: NextRequest, { params }: { params: { paintingId: string } }) {
    const session = await getServerSession(authOptions);
    const paintingId = params.paintingId;

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const paintingDataString = formData.get('paintingData') as string;
        const paintingData = JSON.parse(paintingDataString);
        const { title, dimensions, materials, description, price, images } = paintingData;

        // Намираме картината и проверяваме дали потребителят е собственик
        const painting = await prisma.painting.findUnique({
            where: { id: paintingId },
            include: {
                artist: true,
            },
        });

        if (!painting || painting.artist.userId !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const newImageFiles = formData.getAll('newImages') as File[];
        const uploadedImageUrls: string[] = [];

        for (const file of newImageFiles) {
            if (file instanceof File) {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
                    cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                        if (error) reject(error);
                        resolve(result as { secure_url: string });
                    }).end(buffer);
                });
                uploadedImageUrls.push(uploadResult.secure_url);
            }
        }

        const updatedImages = [...images, ...uploadedImageUrls];

        const updatedPainting = await prisma.painting.update({
            where: { id: paintingId },
            data: {
                title,
                dimensions,
                materials,
                description,
                price: parseFloat(price),
                images: updatedImages,
            },
        });

        return NextResponse.json(updatedPainting);
    } catch (error) {
        console.error('Error updating painting:', error);
        return NextResponse.json({ message: 'Error updating painting' }, { status: 500 });
    }
}

// DELETE /api/paintings/[paintingId] - Изтриване на картина
export async function DELETE(req: NextRequest, { params }: { params: { paintingId: string } }) {
    const session = await getServerSession(authOptions);
    const paintingId = params.paintingId;

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const painting = await prisma.painting.findUnique({
            where: { id: paintingId },
            include: {
                artist: true,
            },
        });

        if (!painting || painting.artist.userId !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // Изтриване на картината
        await prisma.painting.delete({
            where: { id: paintingId },
        });

        return NextResponse.json({ message: 'Painting successfully deleted' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting painting:', error);
        return NextResponse.json({ message: 'Error deleting painting' }, { status: 500 });
    }
}
