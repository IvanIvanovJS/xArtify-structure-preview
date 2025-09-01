// app/api/verify-email/route.ts
import { NextResponse } from "next/server";
import { consumeVerificationToken } from "@/lib/verify";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * GET /api/verify-email?token=...
 * - валидира токена от имейла
 * - маркира потребителя като верифициран (User.emailVerified = now)
 * - редиректва към страница за успех/грешка
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const successUrl = process.env.EMAIL_VERIFY_SUCCESS_URL || "/verify/success";
  const errorUrl = process.env.EMAIL_VERIFY_ERROR_URL || "/verify/error";

  if (!token) {
    return NextResponse.redirect(new URL(errorUrl, url.origin));
  }

  const userId = await consumeVerificationToken(token);
  if (!userId) {
    return NextResponse.redirect(new URL(errorUrl, url.origin));
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
      select: { id: true },
    });

    return NextResponse.redirect(new URL(successUrl, url.origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL(errorUrl, url.origin));
  }
}
