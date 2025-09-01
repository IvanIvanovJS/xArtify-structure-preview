// app/api/register/route.ts
import { NextResponse } from "next/server";
import { RegisterSchema } from "@/lib/validators";
import { parseJson, json } from "@/lib/zhttp";
import { limiter10perMin, rateKey } from "@/lib/rateLimit";
import argon2 from "argon2";
import { generateToken, storeVerificationToken } from "@/lib/verify";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;
  marketingConsent?: boolean;
};

type PublicUser = {
  id: string;
  email: string | null;
  name: string | null;
  createdAt: string;
  emailVerified: string | null;
};

export async function POST(req: Request) {
  // Rate limit (10/min/IP)
  const key = rateKey(req);
  const { success, remaining, reset } = await limiter10perMin.limit(`register:${key}`);
  if (!success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
      },
    });
  }

  // Validate payload
  const parsed = await parseJson(req, RegisterSchema, { maxBytes: 64 * 1024 });
  if (!parsed.success) return parsed.res;
  const data = parsed.data as RegisterPayload;

  try {
    // Unique email guard
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return json({ error: "Имейлът вече е регистриран." }, { status: 409 });

    // Hash password
    const passwordHash = await argon2.hash(data.password, { type: argon2.argon2id });

    // Create user (emailVerified stays null initially)
    const created = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: passwordHash,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true,
      },
    });

    // Generate and store verification token
    const token = generateToken();
    await storeVerificationToken(token, created.id, 60 * 60 * 24);

    // Compute base URL
    const baseUrl =
      process.env.APP_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    // Send via Resend
    if (created.email) {
      await sendVerificationEmail({ to: created.email, token, baseUrl });
    }

    const user: PublicUser = {
      id: created.id,
      email: created.email,
      name: created.name,
      createdAt: created.createdAt.toISOString(),
      emailVerified: created.emailVerified ? created.emailVerified.toISOString() : null,
    };

    return json({ user }, { status: 201 });
  } catch (err: unknown) {
    console.error(err);
    return json({ error: "Неуспешна регистрация." }, { status: 500 });
  }
}
