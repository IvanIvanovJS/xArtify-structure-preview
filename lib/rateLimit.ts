// lib/rateLimit.ts
import 'server-only';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  throw new Error("Missing KV_REST_API_URL or KV_REST_API_TOKEN");
}

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// ==================== ARTIST RATE LIMITERS ====================

// Artist read operations (browsing, filtering, viewing their content)
export const limiterArtistRead = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(80, "1 m"),
  analytics: true,
  prefix: "rl:artist:read",
});

// Artist write operations (create, update, delete content)
export const limiterArtistWrite = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "rl:artist:write",
});

// Auto-refresh endpoints (dashboard, analytics, messages with polling)
export const limiterAutoRefresh = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(40, "1 m"),
  analytics: true,
  prefix: "rl:refresh",
});

// ==================== PUBLIC RATE LIMITERS ====================

// Public browsing (unauthenticated users viewing gallery/artists)
export const limiterPublic = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(150, "1 m"),
  analytics: true,
  prefix: "rl:pub",
});

// ==================== SPECIAL OPERATION LIMITERS ====================

// Heavy operations (uploads, large file processing)
export const limiterHeavy = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
  prefix: "rl:heavy",
});

// Authentication operations (login, register, password reset)
export const limiterAuth = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, "5 m"),
  analytics: true,
  prefix: "rl:auth",
});

// Admin operations (admin panel actions)
export const limiterAdmin = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "1 m"),
  analytics: true,
  prefix: "rl:admin",
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate stable rate limit key
 * Prioritizes userId, falls back to IP address
 */
export function rateKey(req: Request, userId?: string | null): string {
  if (userId && userId.length > 0) return `uid:${userId}`;
  const fwd = req.headers.get("x-forwarded-for");
  const ip = (fwd ? fwd.split(",")[0]?.trim() : null) || "unknown";
  return `ip:${ip}`;
}

// ==================== DEPRECATED (Remove after migration) ====================

/** @deprecated Use limiterArtistRead or limiterArtistWrite instead */
export const limiter10perMin = limiterArtistRead;
