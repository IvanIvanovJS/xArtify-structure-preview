// app/api/artist/artworks/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { limiter10perMin, rateKey } from "@/lib/rateLimit";
import { UpdateArtworkSchema } from "@/lib/validators/artist";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        // Rate limiting
        const session = await getServerSession(authOptions);
        const key = rateKey(req, session?.user?.id);
        const { success } = await limiter10perMin.limit(key);

        if (!success) {
            return NextResponse.json({ message: "Твърде много заявки." }, { status: 429 });
        }

        // Authentication
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Не сте влезли в системата." }, { status: 401 });
        }

        // Get artist profile
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!artistProfile) {
            return NextResponse.json({ message: "Не сте артист." }, { status: 403 });
        }

        // Get params
        const { id } = await params;

        // Parse and validate request body
        const body = await req.json();
        const validatedData = UpdateArtworkSchema.parse({
            ...body,
            id
        });

        // Check if artwork exists and belongs to artist
        const existingArtwork = await prisma.painting.findFirst({
            where: {
                id,
                artistId: artistProfile.id
            }
        });

        if (!existingArtwork) {
            return NextResponse.json({ message: "Картината не е намерена." }, { status: 404 });
        }

        // Generate URL title if title is being updated
        let urlTitle = validatedData.slug;
        if (validatedData.title && !urlTitle) {
            urlTitle = validatedData.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 120);
        }

        // Ensure unique URL title if it's being changed
        if (urlTitle && urlTitle !== existingArtwork.urlTitle) {
            let finalUrlTitle = urlTitle;
            let counter = 1;
            while (await prisma.painting.findUnique({
                where: {
                    urlTitle: finalUrlTitle,
                    NOT: { id }
                }
            })) {
                finalUrlTitle = `${urlTitle}-${counter}`;
                counter++;
            }
            urlTitle = finalUrlTitle;
        }

        // Update artwork
        const updatedArtwork = await prisma.painting.update({
            where: { id },
            data: {
                ...validatedData,
                urlTitle: urlTitle || existingArtwork.urlTitle,
                slug: validatedData.slug || urlTitle || existingArtwork.slug
            }
        });

        return NextResponse.json(updatedArtwork);

    } catch (error) {
        console.error('Artwork PUT API Error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ message: 'Невалидни данни.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        // Rate limiting
        const session = await getServerSession(authOptions);
        const key = rateKey(req, session?.user?.id);
        const { success } = await limiter10perMin.limit(key);

        if (!success) {
            return NextResponse.json({ message: "Твърде много заявки." }, { status: 429 });
        }

        // Authentication
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Не сте влезли в системата." }, { status: 401 });
        }

        // Get artist profile
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!artistProfile) {
            return NextResponse.json({ message: "Не сте артист." }, { status: 403 });
        }

        // Get params
        const { id } = await params;

        // Check if artwork exists and belongs to artist
        const existingArtwork = await prisma.painting.findFirst({
            where: {
                id,
                artistId: artistProfile.id
            }
        });

        if (!existingArtwork) {
            return NextResponse.json({ message: "Картината не е намерена." }, { status: 404 });
        }

        // Check if artwork has any sales
        const salesCount = await prisma.sale.count({
            where: {
                paintingId: id,
                status: 'completed'
            }
        });

        if (salesCount > 0) {
            return NextResponse.json({
                message: "Не можете да изтриете картина с завършени продажби."
            }, { status: 400 });
        }

        // Delete artwork
        await prisma.painting.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Картината е изтрита." });

    } catch (error) {
        console.error('Artwork DELETE API Error:', error);

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

