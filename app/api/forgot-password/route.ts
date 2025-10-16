// app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import { prisma } from "@/lib/prisma";
import { limiterAuth, rateKey } from "@/lib/rateLimit";
export const runtime = "nodejs";


// Инициализираме Resend с API ключа от .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        // Rate limiting
        const key = rateKey(req);
        const { success } = await limiterAuth.limit(key);
        if (!success) {
            return NextResponse.json({ message: "Твърде много заявки. Моля опитайте отново по-късно." }, { status: 429 });
        }

        const { email } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // За сигурност, не казвайте на потребителя дали имейлът съществува
            return NextResponse.json({ message: 'Ако имате акаунт, ще получите имейл с инструкции.' }, { status: 200 });
        }

        // Генериране на уникален токен
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 1800000); // Токенът изтича след 30 минути

        // Записване на токена в базата данни
        await prisma.passwordResetToken.create({
            data: {
                token: resetToken,
                expires,
                userId: user.id,
            },
        });

        // Изпращане на имейл с Resend
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;

        await resend.emails.send({
            from: process.env.RESEND_FROM ?? "no-reply@xartify.com", // Използвайте верифициран имейл
            to: email,
            subject: 'Възстановяване на парола',
            html: `<p>Кликнете <a href="${resetUrl}">тук</a>, за да смените паролата си.</p>`,
        });

        return NextResponse.json({ message: 'Ако имате акаунт, ще получите имейл с инструкции.' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Възникна грешка.' }, { status: 500 });
    }
}
