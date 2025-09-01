import 'server-only';
import { headers } from 'next/headers';


export async function getBaseUrl(): Promise<string> {
    // Ако имате конфигуриран прод домейн, това е най-стабилното
    if (process.env.APP_BASE_URL) {
        return process.env.APP_BASE_URL.replace(/\/$/, '');
    }
    const h = await headers();
    const proto = h.get('x-forwarded-proto') || 'https';
    const host = h.get('x-forwarded-host') || h.get('host') || process.env.VERCEL_URL || 'localhost:3000';
    return `${proto}://${host}`;
}