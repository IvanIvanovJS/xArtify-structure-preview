// lib/rateLimit.ts
import 'server-only';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  throw new Error("Missing KV_REST_API_URL or KV_REST_API_TOKEN");
}

// Използваме Vercel KV (Upstash) REST креденшъли
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// 10 req/min (sliding window)
export const limiter10perMin = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "rl:global",
});

// 120 req/min за публични заявки
export const limiterPublic = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, "1 m"),
  analytics: true,
  prefix: "rl:pub",
});

// Стабилен ключ за rate limit
export function rateKey(req: Request, userId?: string | null): string {
  if (userId && userId.length > 0) return `uid:${userId}`;
  const fwd = req.headers.get("x-forwarded-for");
  const ip = (fwd ? fwd.split(",")[0]?.trim() : null) || "unknown";
  return `ip:${ip}`;
}
