// app/api/verify-email/route.ts
import { NextResponse } from "next/server";
import { consumeVerificationToken } from "@/lib/verify";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * GET /api/verify-email?token=...
 * - валидира токена от имейла
 * - маркира потребителя като верифициран
 * - редиректва към страница за успех/грешка
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  const successUrl = "/login?verified=1"; // смени при нужда
  const errorUrl = "/login?verified=0";  // смени при нужда

  if (!token) {
    return NextResponse.redirect(new URL(errorUrl, url.origin));
  }

  try {
    const userId = await consumeVerificationToken(token);
    if (!userId) {
      return NextResponse.redirect(new URL(errorUrl, url.origin));
    }

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
      select: { id: true },
    });

    return NextResponse.redirect(new URL(successUrl, url.origin));
  } catch (e) {
    console.error("/api/verify-email error:", e);
    return NextResponse.redirect(new URL(errorUrl, url.origin));
  }
}
