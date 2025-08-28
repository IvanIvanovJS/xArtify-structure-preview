// app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        // 1. Проверка за съществуващ потребител
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ message: "Потребител с този имейл вече съществува." }, { status: 409 });
        }

        // 2. Хеширане на паролата
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Създаване на нов потребител
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "USER", // Задаваме роля по подразбиране
            },
        });

        return NextResponse.json({ message: "Потребителят е успешно регистриран." }, { status: 201 });
    } catch (error) {
        console.error("Error during registration:", error);
        return NextResponse.json({ message: "Възникна грешка при регистрацията." }, { status: 500 });
    }
}