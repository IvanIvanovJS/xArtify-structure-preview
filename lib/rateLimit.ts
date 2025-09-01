// lib/rateLimit.ts
import 'server-only';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  throw new Error("Missing KV_REST_API_URL or KV_REST_API_TOKEN");
}

// Use Vercel KV (Upstash) REST creds
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// 10 requests / minute (sliding window)
export const limiter10perMin = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "rl:global",
});

// 120 requests / minute for public GET
export const limiterPublic = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, "1 m"),
  analytics: true,
  prefix: "rl:pub",
});

// Build a stable key: prefer userId; fallback to IP
export function rateKey(req: Request, userId?: string | null) {
  if (userId) return `uid:${userId}`;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    (req as any).ip ||
    (req as any).socket?.remoteAddress ||
    "unknown";
  return `ip:${ip}`;
}
