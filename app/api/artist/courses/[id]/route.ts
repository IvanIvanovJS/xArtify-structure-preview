// app/api/artist/courses/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { limiter10perMin, rateKey } from "@/lib/rateLimit";
import { UpdateCourseSchema } from "@/lib/validators/artist";

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
        const validatedData = UpdateCourseSchema.parse({
            ...body,
            id
        });

        // Check if course exists and belongs to artist
        const existingCourse = await prisma.course.findFirst({
            where: {
                id,
                artistId: artistProfile.id
            }
        });

        if (!existingCourse) {
            return NextResponse.json({ message: "Курсът не е намерен." }, { status: 404 });
        }

        // Update course
        const updatedCourse = await prisma.course.update({
            where: { id },
            data: validatedData
        });

        return NextResponse.json(updatedCourse);

    } catch (error) {
        console.error('Course PUT API Error:', error);

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

        // Check if course exists and belongs to artist
        const existingCourse = await prisma.course.findFirst({
            where: {
                id,
                artistId: artistProfile.id
            }
        });

        if (!existingCourse) {
            return NextResponse.json({ message: "Курсът не е намерен." }, { status: 404 });
        }

        // Check if course has any enrollments
        const enrollmentCount = await prisma.enrollment.count({
            where: {
                courseId: id
            }
        });

        if (enrollmentCount > 0) {
            return NextResponse.json({
                message: "Не можете да изтриете курс с записани студенти."
            }, { status: 400 });
        }

        // Delete course
        await prisma.course.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Курсът е изтрит." });

    } catch (error) {
        console.error('Course DELETE API Error:', error);

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

