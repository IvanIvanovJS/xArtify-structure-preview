// /middleware.ts — FINAL: nonce-based CSP that works with Next.js dev/prod
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    // 🔒 CRITICAL: Basic session validation for protected routes
    const { pathname } = request.nextUrl;
    const protectedRoutes = ['/admin', '/upload-artwork', '/my-profile', '/become-an-artist'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute) {
        // Check for NextAuth session cookie (works with database sessions)
        const sessionToken = request.cookies.get('next-auth.session-token') ||
            request.cookies.get('__Secure-next-auth.session-token');

        if (!sessionToken) {
            // Redirect to login if no session cookie
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Edge-safe nonce (no Buffer in middleware runtime)
    const nonce = crypto.randomUUID();
    const isDev = process.env.NODE_ENV === "development";

    const csp = [
        "default-src 'self'",
        // Scripts must have nonce; allow Stripe/GTM; enable unsafe-eval only in dev (Fast Refresh)
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://www.googletagmanager.com ${isDev ? "'unsafe-eval'" : ""}`,
        // Styles: <style> tags require nonce; in dev also allow unsafe-inline to avoid toolchain inserts without nonce
        `style-src-elem 'self' 'nonce-${nonce}' ${isDev ? "'unsafe-inline'" : ""}`,
        // Allow style attributes explicitly (required by some libs / next/image)
        "style-src-attr 'unsafe-inline'",
        // Images (incl. phone input flag icons hosted on GitHub Pages)
        "img-src 'self' data: blob: https://lh3.googleusercontent.com https://res.cloudinary.com data: blob: https://placehold.co https://purecatamphetamine.github.io",
        " media-src 'self' https://res.cloudinary.com blob:",
        "font-src 'self' data:",
        "connect-src 'self' https://api.stripe.com https://res.cloudinary.com https://www.google-analytics.com https://www.googletagmanager.com",
        "frame-src https://js.stripe.com",
        // Hardening
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
    ].join("; ");

    // Pass nonce to Next.js via REQUEST so it can attach it to its own scripts/styles
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);

    const response = NextResponse.next({ request: { headers: requestHeaders } });

    // Enforce CSP in RESPONSE for the browser
    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    response.headers.set("X-DNS-Prefetch-Control", "off");

    if (process.env.NODE_ENV === "production") {
        response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    }

    return response;
}

// Apply everywhere except static assets
export const config = {
    matcher: [
        {
            source: "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets/).*)",
            missing: [
                { type: "header", key: "next-router-prefetch" },
                { type: "header", key: "purpose", value: "prefetch" },
            ],
        },
    ],
};
