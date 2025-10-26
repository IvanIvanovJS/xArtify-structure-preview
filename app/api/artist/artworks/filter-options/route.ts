// app/api/artist/artworks/filter-options/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { limiterArtistRead, rateKey } from "@/lib/rateLimit";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        // Rate limiting
        const session = await getServerSession(authOptions);
        const key = rateKey(req, session?.user?.id);
        const { success } = await limiterArtistRead.limit(key);

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

        // Get unique values for each filter from existing artworks
        const artworks = await prisma.painting.findMany({
            where: { artistId: artistProfile.id },
            select: {
                technique: true,
                subject: true,
                style: true,
                status: true,
                isOnSale: true,
                isSold: true
            }
        });

        // Extract unique values
        const techniques = [...new Set(artworks.map(a => a.technique).filter(Boolean))];
        const subjects = [...new Set(artworks.map(a => a.subject).filter(Boolean))];
        const styles = [...new Set(artworks.map(a => a.style).filter(Boolean))];

        // For status, we need to consider both status and isSold fields
        const statuses = [...new Set(artworks.map(a => a.isSold ? 'sold' : a.status).filter(Boolean))];

        // For sale status
        const hasOnSale = artworks.some(a => a.isOnSale);
        const hasNotOnSale = artworks.some(a => !a.isOnSale);

        const response = {
            techniques: techniques.sort(),
            subjects: subjects.sort(),
            styles: styles.sort(),
            statuses: statuses.sort(),
            hasOnSale,
            hasNotOnSale
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Filter options GET API Error:', error);
        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}
