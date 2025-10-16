import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextRequest } from "next/server";

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

/**
 * Проверява дали текущият потребител е admin
 * Използва се в API routes и server components
 */
export async function requireAdmin(): Promise<AdminUser> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error("Не сте автентикирани");
    }

    if (session.user.role !== "ADMIN") {
        throw new Error("Нямате права за тази операция");
    }

    return {
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.name || "",
        role: session.user.role
    };
}

/**
 * Проверява дали текущият потребител е admin (без да хвърля грешка)
 * Връща null ако не е admin
 */
export async function getAdminUser(): Promise<AdminUser | null> {
    try {
        return await requireAdmin();
    } catch {
        return null;
    }
}

/**
 * Проверява дали потребителят има определена роля
 */
export async function requireRole(requiredRole: "USER" | "ARTIST" | "ADMIN"): Promise<AdminUser> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error("Не сте автентикирани");
    }

    if (session.user.role !== requiredRole) {
        throw new Error(`Нямате права за тази операция. Изисква се роля: ${requiredRole}`);
    }

    return {
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.name || "",
        role: session.user.role
    };
}

/**
 * Проверява дали потребителят има поне една от изискваните роли
 */
export async function requireAnyRole(roles: ("USER" | "ARTIST" | "ADMIN")[]): Promise<AdminUser> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error("Не сте автентикирани");
    }

    if (!roles.includes(session.user.role as "USER" | "ARTIST" | "ADMIN")) {
        throw new Error(`Нямате права за тази операция. Изисква се една от ролите: ${roles.join(", ")}`);
    }

    return {
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.name || "",
        role: session.user.role
    };
}

// Rate limiting moved to lib/rateLimit.ts - use limiterAdmin instead

/**
 * Извлича IP адрес от заявката
 */
export function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");

    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    if (realIP) {
        return realIP;
    }

    return "unknown";
}
