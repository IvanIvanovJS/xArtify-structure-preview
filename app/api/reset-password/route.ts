// app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        // 1. Проверка на токена
        const passwordResetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!passwordResetToken || passwordResetToken.expires < new Date()) {
            return NextResponse.json({ message: 'Невалиден или изтекъл токен.' }, { status: 400 });
        }

        // 2. Хеширане на новата парола
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Актуализиране на потребителя и изтриване на токена
        await prisma.$transaction([
            prisma.user.update({
                where: { id: passwordResetToken.userId },
                data: { password: hashedPassword },
            }),
            prisma.passwordResetToken.delete({
                where: { id: passwordResetToken.id },
            }),
        ]);

        return NextResponse.json({ message: 'Паролата ви беше успешно сменена.' }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Възникна грешка.' }, { status: 500 });
    }
}
