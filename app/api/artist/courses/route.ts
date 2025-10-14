// app/api/artist/courses/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { limiter10perMin, rateKey } from "@/lib/rateLimit";
import { CreateCourseSchema, CourseFiltersSchema } from "@/lib/validators/artist";

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

        // Get artist profile
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!artistProfile) {
            return NextResponse.json({ message: "Не сте артист." }, { status: 403 });
        }

        // Parse query parameters
        const { searchParams } = new URL(req.url);
        const query = Object.fromEntries(searchParams.entries());
        const validatedQuery = CourseFiltersSchema.parse(query);

        // Build where clause
        const where: {
            artistId: string;
            status?: string;
            technique?: string;
            subject?: string;
            style?: string;
            isOnSale?: boolean;
            OR?: Array<{
                title?: { contains: string; mode: 'insensitive' };
                description?: { contains: string; mode: 'insensitive' };
                tags?: { has: string };
            }>;
        } = {
            artistId: artistProfile.id
        };

        if (validatedQuery.search) {
            where.OR = [
                { title: { contains: validatedQuery.search, mode: 'insensitive' } },
                { description: { contains: validatedQuery.search, mode: 'insensitive' } }
            ];
        }

        // Get courses with pagination
        const [courses, totalCount] = await Promise.all([
            prisma.course.findMany({
                where,
                include: {
                    enrollments: {
                        select: { id: true }
                    },
                    materials: {
                        select: { id: true, name: true, price: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (validatedQuery.page - 1) * validatedQuery.limit,
                take: validatedQuery.limit
            }),

            prisma.course.count({ where })
        ]);

        // Transform courses to include enrollment count
        const coursesWithStats = courses.map(course => ({
            ...course,
            enrollmentCount: course.enrollments.length
        }));

        const response = {
            courses: coursesWithStats,
            pagination: {
                page: validatedQuery.page,
                limit: validatedQuery.limit,
                total: totalCount,
                pages: Math.ceil(totalCount / validatedQuery.limit)
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Courses GET API Error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ message: 'Невалидни параметри.' }, { status: 400 });
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
        const validatedData = CreateCourseSchema.parse(body);

        // Create course
        const course = await prisma.course.create({
            data: {
                ...validatedData,
                artistId: artistProfile.id
            }
        });

        return NextResponse.json(course, { status: 201 });

    } catch (error) {
        console.error('Courses POST API Error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ message: 'Невалидни данни.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

