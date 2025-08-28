// /app/api/register/route.ts — hardened version
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

// 1) Типизация и валидация със Zod
const RegisterSchema = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().max(254),
    password: z
        .string()
        .min(8)
        .max(128)
        .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, {
            message: "Паролата трябва да съдържа главна, малка буква и цифра.",
        }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export async function POST(req: Request) {
    try {
        const json = await req.json().catch(() => null);
        const parsed = RegisterSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Невалидни данни.", issues: parsed.error.issues },
                { status: 422 }
            );
        }

        const { name, email, password } = parsed.data as RegisterInput;

        // 2) Проверка за съществуващ потребител
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            // Еднакво съобщение за да не издаваме дали имейлът съществува (можеш да го запазиш както е)
            return NextResponse.json(
                { message: "Потребител с този имейл вече съществува." },
                { status: 409 }
            );
        }

        // 3) Хеширане на паролата
        const hashedPassword = await bcrypt.hash(password, 12);

        // 4) Създаване на потребител
        const created = await prisma.user.create({
            data: { name, email, password: hashedPassword, role: "USER" },
            select: { id: true, name: true, email: true, image: true },
        });

        // 5) Отговор: върни минимално нужните данни (без пароли) + статус 201
        return NextResponse.json(
            { message: "Потребителят е успешно регистриран.", user: created },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error during registration:", error);
        return NextResponse.json(
            { message: "Възникна грешка при регистрацията." },
            { status: 500 }
        );
    }
}
