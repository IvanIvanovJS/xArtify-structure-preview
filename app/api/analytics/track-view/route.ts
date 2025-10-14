// app/api/analytics/track-view/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { limiterPublic, rateKey } from "@/lib/rateLimit";
import { TrackViewSchema } from "@/lib/validators/artist";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        // Rate limiting (more lenient for public tracking)
        const session = await getServerSession(authOptions);
        const key = rateKey(req, session?.user?.id);
        const { success } = await limiterPublic.limit(key);

        if (!success) {
            return NextResponse.json({ message: "Твърде много заявки." }, { status: 429 });
        }

        // Parse and validate request body
        const body = await req.json();
        const validatedData = TrackViewSchema.parse(body);

        // Get IP address and user agent
        const forwarded = req.headers.get("x-forwarded-for");
        const ipAddress = forwarded ? forwarded.split(",")[0]?.trim() : "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";

        // Track the view
        if (validatedData.type === 'painting') {
            // Verify painting exists
            const painting = await prisma.painting.findUnique({
                where: { id: validatedData.id },
                select: { id: true, artistId: true }
            });

            if (!painting) {
                return NextResponse.json({ message: "Картината не е намерена." }, { status: 404 });
            }

            // Create painting view record
            await prisma.paintingView.create({
                data: {
                    paintingId: validatedData.id,
                    userId: session?.user?.id || null,
                    ipAddress,
                    userAgent
                }
            });

        } else if (validatedData.type === 'profile') {
            // Verify artist profile exists
            const artistProfile = await prisma.artistProfile.findUnique({
                where: { id: validatedData.id },
                select: { id: true }
            });

            if (!artistProfile) {
                return NextResponse.json({ message: "Профилът не е намерен." }, { status: 404 });
            }

            // Create profile view record
            await prisma.profileView.create({
                data: {
                    artistId: validatedData.id,
                    userId: session?.user?.id || null,
                    ipAddress,
                    userAgent
                }
            });
        }

        return NextResponse.json({ message: "Прегледът е записан." });

    } catch (error) {
        console.error('Track View API Error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ message: 'Невалидни данни.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

