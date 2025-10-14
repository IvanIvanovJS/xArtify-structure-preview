// app/api/artist/settings/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { limiter10perMin, rateKey } from "@/lib/rateLimit";
import { UpdateArtistSettingsSchema, CreateArtistFAQSchema, UpdateArtistFAQSchema } from "@/lib/validators/artist";

export async function GET(req: NextRequest): Promise<NextResponse> {
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

        // Get artist profile with all related data
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true
                    }
                },
                faqs: {
                    orderBy: { createdAt: 'desc' }
                },
                tags: {
                    orderBy: { createdAt: 'desc' }
                },
                subscription: {
                    include: { plan: true }
                }
            }
        });

        if (!artistProfile) {
            return NextResponse.json({ message: "Не сте артист." }, { status: 403 });
        }

        // Notifications are already included in artistProfile

        const settingsData = {
            profile: {
                id: artistProfile.id,
                bio: artistProfile.bio,
                website: artistProfile.website,
                instagram: artistProfile.instagram,
                facebook: artistProfile.facebook,
                twitter: artistProfile.twitter,
                location: artistProfile.location,
                specialties: artistProfile.specialties || [],
                experience: artistProfile.experience,
                education: artistProfile.education,
                awards: artistProfile.awards,
                user: artistProfile.user
            },
            notifications: {
                emailNotifications: artistProfile.emailNotifications || false,
                saleNotifications: artistProfile.salesNotifications || false,
                messageNotifications: artistProfile.messageNotifications || false,
                marketingEmails: false // Not implemented yet
            }
        };

        return NextResponse.json(settingsData);

    } catch (error) {
        console.error('Settings GET API Error:', error);

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
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

        // Parse and validate request body
        const body = await req.json();
        const validatedData = UpdateArtistSettingsSchema.parse(body);

        // Update artist profile
        const updatedProfile = await prisma.artistProfile.update({
            where: { id: artistProfile.id },
            data: validatedData
        });

        return NextResponse.json(updatedProfile);

    } catch (error) {
        console.error('Settings PUT API Error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ message: 'Невалидни данни.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
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

        // Parse and validate request body
        const body = await req.json();
        const validatedData = CreateArtistFAQSchema.parse(body);

        // Create FAQ
        const faq = await prisma.artistFAQ.create({
            data: {
                ...validatedData,
                artistId: artistProfile.id
            }
        });

        return NextResponse.json(faq, { status: 201 });

    } catch (error) {
        console.error('Settings POST API Error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ message: 'Невалидни данни.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
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

        // Parse and validate request body
        const body = await req.json();
        const validatedData = UpdateArtistFAQSchema.parse(body);

        // Check if FAQ exists and belongs to artist
        const existingFAQ = await prisma.artistFAQ.findFirst({
            where: {
                id: validatedData.id,
                artistId: artistProfile.id
            }
        });

        if (!existingFAQ) {
            return NextResponse.json({ message: "FAQ не е намерен." }, { status: 404 });
        }

        // Update FAQ
        const updatedFAQ = await prisma.artistFAQ.update({
            where: { id: validatedData.id },
            data: validatedData
        });

        return NextResponse.json(updatedFAQ);

    } catch (error) {
        console.error('Settings PATCH API Error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ message: 'Невалидни данни.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
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

        // Get FAQ ID from query parameters
        const { searchParams } = new URL(req.url);
        const faqId = searchParams.get('faqId');

        if (!faqId) {
            return NextResponse.json({ message: "FAQ ID е задължителен." }, { status: 400 });
        }

        // Check if FAQ exists and belongs to artist
        const existingFAQ = await prisma.artistFAQ.findFirst({
            where: {
                id: faqId,
                artistId: artistProfile.id
            }
        });

        if (!existingFAQ) {
            return NextResponse.json({ message: "FAQ не е намерен." }, { status: 404 });
        }

        // Delete FAQ
        await prisma.artistFAQ.delete({
            where: { id: faqId }
        });

        return NextResponse.json({ message: "FAQ е изтрит." });

    } catch (error) {
        console.error('Settings DELETE API Error:', error);

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

