import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/favorites/[paintingId] - Check if painting is favorited
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ paintingId: string }> }
): Promise<NextResponse> {
    const { paintingId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ isFavorite: false }, { status: 200 });
    }

    try {
        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_paintingId: {
                    userId: session.user.id,
                    paintingId: paintingId
                }
            }
        });

        return NextResponse.json({ isFavorite: !!favorite }, { status: 200 });
    } catch (error) {
        console.error('Error checking favorite status:', error);
        return NextResponse.json({ isFavorite: false }, { status: 200 });
    }
}

// POST /api/favorites/[paintingId] - Add painting to favorites
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ paintingId: string }> }
): Promise<NextResponse> {
    const { paintingId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        // Check if painting exists
        const painting = await prisma.painting.findUnique({
            where: { id: paintingId }
        });

        if (!painting) {
            return NextResponse.json({ message: "Painting not found" }, { status: 404 });
        }

        // Check if already favorited
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_paintingId: {
                    userId: session.user.id,
                    paintingId: paintingId
                }
            }
        });

        if (existingFavorite) {
            return NextResponse.json({ message: "Already favorited" }, { status: 200 });
        }

        // Add to favorites
        await prisma.favorite.create({
            data: {
                userId: session.user.id,
                paintingId: paintingId
            }
        });

        return NextResponse.json({ message: "Added to favorites" }, { status: 200 });
    } catch (error) {
        console.error('Error adding to favorites:', error);
        return NextResponse.json({ message: "Error adding to favorites" }, { status: 500 });
    }
}

// DELETE /api/favorites/[paintingId] - Remove painting from favorites
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ paintingId: string }> }
): Promise<NextResponse> {
    const { paintingId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await prisma.favorite.delete({
            where: {
                userId_paintingId: {
                    userId: session.user.id,
                    paintingId: paintingId
                }
            }
        });

        return NextResponse.json({ message: "Removed from favorites" }, { status: 200 });
    } catch (error) {
        console.error('Error removing from favorites:', error);
        return NextResponse.json({ message: "Error removing from favorites" }, { status: 500 });
    }
}
