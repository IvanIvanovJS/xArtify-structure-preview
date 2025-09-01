// lib/verify.ts
import { randomBytes } from "crypto";
import { kv } from "@vercel/kv"; // или вашият store


export function generateToken(): string {
  return randomBytes(32).toString("hex");
}


export async function storeVerificationToken(token: string, userId: string, ttlSeconds: number): Promise<void> {
  await kv.set(`verify:${token}`, userId, { ex: ttlSeconds });
}


export async function consumeVerificationToken(token: string): Promise<string | null> {
  const key = `verify:${token}`;
  const userId = (await kv.get<string>(key)) ?? null;
  if (!userId) return null;
  await kv.del(key);
  return userId;
}