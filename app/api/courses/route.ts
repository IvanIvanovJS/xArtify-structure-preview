// app/api/courses/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET /api/courses - Връща всички курсове
export async function GET() {
    try {
        const courses = await prisma.course.findMany({
            include: {
                materials: true
            }
        });
        return NextResponse.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json({ message: 'Error fetching courses' }, { status: 500 });
    }
}

// POST /api/courses - Добавя нов курс (само за администратори)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { title, description, price, videoUrls, materials } = await req.json();

        const newCourse = await prisma.course.create({
            data: {
                title,
                description,
                price,
                videoUrls,
                artistId: session.user.id, // Add required artistId
                materials: {
                    connect: materials.map((id: string) => ({ id })) // Пример за свързване на съществуващи материали
                }
            },
        });

        return NextResponse.json(newCourse, { status: 201 });
    } catch (error) {
        console.error('Error creating course:', error);
        return NextResponse.json({ message: 'Error creating course' }, { status: 500 });
    }
}