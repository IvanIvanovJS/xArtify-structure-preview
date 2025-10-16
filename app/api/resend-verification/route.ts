// app/api/resend-verification/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, json } from "@/lib/zhttp";
import { limiterAuth, rateKey } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { generateToken, storeVerificationToken } from "@/lib/verify";
import { sendVerificationEmail } from "@/lib/email";

export const runtime = "nodejs";

// Zod schema: само имейл
const ResendVerificationSchema = z.object({
    email: z.string().trim().toLowerCase().email("Невалиден email."),
}).strict();

// Време на валидност на линка (24h)
const TOKEN_TTL_SECONDS = 60 * 60 * 24;

// За да не издаваме дали имейлът съществува, връщаме винаги 200 със същото съобщение
function genericOk() {
    return json({ message: "Ако съществува акаунт с този имейл, изпратихме нов линк за потвърждение." }, { status: 200 });
}

export async function POST(req: Request) {
    // Rate limit (10/min per IP)
    const key = rateKey(req);
    const { success, remaining, reset } = await limiterAuth.limit(`resend:${key}`);
    if (!success) {
        return new NextResponse("Too Many Requests", {
            status: 429,
            headers: {
                "X-RateLimit-Remaining": String(remaining),
                "X-RateLimit-Reset": String(reset),
            },
        });
    }

    // Валидация на тялото
    const parsed = await parseJson(req, ResendVerificationSchema, { maxBytes: 32 * 1024 });
    if (!parsed.success) return parsed.res;
    const { email } = parsed.data;

    try {
        // 1) Намираме потребителя по имейл
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, emailVerified: true },
        });

        // Ако няма такъв — не издаваме информация
        if (!user || !user.email) {
            return genericOk();
        }

        // Ако вече е верифициран — пак връщаме generic 200
        if (user.emailVerified) {
            return genericOk();
        }

        // 2) Генерираме токен и го пазим в KV
        const token = generateToken();
        await storeVerificationToken(token, user.id, TOKEN_TTL_SECONDS);

        // 3) Изчисляваме base URL
        const baseUrl = process.env.APP_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

        // 4) Изпращаме имейл през Resend
        await sendVerificationEmail({ to: user.email, token, baseUrl });

        return genericOk();
    } catch (err: unknown) {
        console.error(err);
        // Не издаваме подробности
        return genericOk();
    }
}
