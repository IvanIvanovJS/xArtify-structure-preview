// src/lib/verify.ts
import 'server-only';
import { kv } from '@vercel/kv';
import crypto from 'crypto';

/** Генерира криптографски токен */
export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex'); // 64 hex chars
}

/** Съхранява токен в KV с TTL (секунди) */
export async function storeVerificationToken(token: string, userId: string, ttlSeconds = 60 * 60 * 24) {
  await kv.set(`verify:token:${token}`, userId, { ex: ttlSeconds });
}

/** Валидира токен: връща userId или null */
export async function consumeVerificationToken(token: string): Promise<string | null> {
  const key = `verify:token:${token}`;
  const userId = await kv.get<string>(key);
  if (!userId) return null;
  await kv.del(key);
  return userId;
}
