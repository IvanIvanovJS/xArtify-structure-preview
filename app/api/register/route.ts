// app/api/register/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { generateToken, storeVerificationToken } from "@/lib/verify";
import { sendVerificationEmail } from "@/lib/email";
import { limiterAuth, rateKey } from "@/lib/rateLimit";

export const runtime = "nodejs";

// Валидация на входа
const RegisterSchema = z.object({
  name: z.string().trim().min(2, "Името трябва да бъде поне 2 символа."),
  email: z.string().trim().toLowerCase().email("Невалиден email."),
  password: z.string().min(6, "Паролата трябва да бъде поне 6 символа."),
  confirmPassword: z.string(),
  terms: z.boolean(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["confirmPassword"], message: "Паролите не съвпадат." });
  }
  if (!data.terms) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["terms"], message: "Трябва да приемете Общите условия." });
  }
});

function json<T>(payload: T, init?: ResponseInit): NextResponse<T> {
  return NextResponse.json<T>(payload, init);
}

const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24ч

export async function POST(req: Request): Promise<NextResponse> {
  // Rate limiting
  const key = rateKey(req);
  const { success } = await limiterAuth.limit(key);
  if (!success) {
    return json({ message: "Твърде много заявки. Моля опитайте отново по-късно." }, { status: 429 });
  }

  let bodyUnknown: unknown;
  try {
    bodyUnknown = await req.json();
  } catch {
    return json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(bodyUnknown);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const field = (first?.path?.[0] as string | undefined) ?? undefined;
    const message = first?.message ?? "Невалидни данни.";
    return json({ field, message }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  try {
    // Дублиран имейл
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return json({ field: "email", message: "Имейлът вече е зает." }, { status: 400 });
    }

    // Хеширане на парола
    const passwordHash = await hash(password, 12);

    // Създаване на потребителя и Account записа в transaction
    const result = await prisma.$transaction(async (tx) => {
      // Създаване на потребителя
      const user = await tx.user.create({
        data: { name, email, password: passwordHash, emailVerified: null },
        select: { id: true, email: true },
      });

      // Създаване на Account запис за credentials provider
      const account = await tx.account.create({
        data: {
          userId: user.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: user.id,
        }
      });

      return { user, account };
    });

    const { user, account } = result;

    console.log('✅ User and Account created successfully:', {
      userId: user.id,
      email: user.email,
      accountId: account.id,
      accountProvider: account.provider
    });

    // Токен за верификация
    const token = generateToken();
    await storeVerificationToken(token, user.id, TOKEN_TTL_SECONDS);

    // Base URL
    const baseUrl = process.env.APP_BASE_URL
      || process.env.NEXT_PUBLIC_APP_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    // Изпращане на имейл (логваме грешки, но не ги изливаме към клиента)
    if (user.email) {
      try {
        await sendVerificationEmail({ to: user.email, token, baseUrl });
      } catch (e) {
        console.error("sendVerificationEmail failed:", e);
      }
    }

    return json({ message: "Успешна регистрация. Проверете имейла си за верификация." }, { status: 200 });
  } catch (err) {
    console.error("/api/register error:", err);
    return json({ message: "Неуспешна регистрация. Опитайте отново." }, { status: 500 });
  }
}
