// app/api/register/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs"; // увери се, че е инсталирано
import { generateToken, storeVerificationToken } from "@/lib/verify";
import { sendVerificationEmail } from "@/lib/email";


export const runtime = "nodejs";


const RegisterSchema = z
  .object({
    name: z.string().trim().min(2, "Името трябва да бъде поне 2 символа."),
    email: z.string().trim().toLowerCase().email("Невалиден email."),
    password: z.string().min(6, "Паролата трябва да бъде поне 6 символа."),
    confirmPassword: z.string(),
    terms: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Паролите не съвпадат.",
      });
    }
    if (!data.terms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["terms"],
        message: "Трябва да се съгласите с Общите условия.",
      });
    }
  });

const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24h


function json<T>(payload: T, init?: ResponseInit): NextResponse<T> {
  return NextResponse.json<T>(payload, init);
}


export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ message: "Invalid JSON body." }, { status: 400 });
  }


  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    // Намираме първата field-грешка за по-добро UX
    const first = parsed.error.issues[0];
    const field = first?.path?.[0];
    const message = first?.message ?? "Невалидни данни.";
    return json({ field, message }, { status: 400 });
  }


  const { name, email, password } = parsed.data;


  try {
    // 1) Дублиран имейл?
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return json({ field: "email", message: "Имейлът вече е зает." }, { status: 400 });
    }


    // 2) Хеш на паролата
    const passwordHash = await hash(password, 12);


    // 3) Създаване на потребителя (emailVerified = null)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        emailVerified: null,
      },
      select: { id: true, email: true },
    });


    // 4) Verification token
    const token = generateToken();
    await storeVerificationToken(token, user.id, TOKEN_TTL_SECONDS);


    // 5) Base URL за линка
    const baseUrl = process.env.APP_BASE_URL
      || (process.env.NEXT_PUBLIC_APP_URL ?? null)
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");


    // 6) Пращаме имейла
    if (user.email && baseUrl) {
      console.log("test");

      await sendVerificationEmail({ to: user.email, token, baseUrl });
    }


    return json({ message: "Успешна регистрация.", autoLogin: true }, { status: 200 });
  } catch (err) {
    // Логни детайлно на сървъра, но върни общо съобщение
    console.error("/api/register error:", err);
    return json({ message: "Неуспешна регистрация. Опитайте отново." }, { status: 500 });
  }
}