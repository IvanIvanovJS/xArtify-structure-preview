// app/(auth)/verify/page.tsx
import { prisma } from "@/lib/prisma";
import { consumeVerificationToken } from "@/lib/verify";
import { redirect } from "next/navigation";
import { JSX } from "react";

export default async function VerifyPage({
    searchParams,
}: {
    searchParams: { token?: string };
}): Promise<JSX.Element> {
    const token = searchParams?.token;
    if (!token) {
        return (
            <main className="mx-auto max-w-md px-6 py-12">
                <h1 className="text-2xl font-semibold mb-4">Потвърждение на имейл</h1>
                <p>Липсва токен.</p>
            </main>
        );
    }

    const userId = await consumeVerificationToken(token);
    if (!userId) {
        return (
            <main className="mx-auto max-w-md px-6 py-12">
                <h1 className="text-2xl font-semibold mb-4">Потвърждение на имейл</h1>
                <p>Невалиден или изтекъл линк.</p>
            </main>
        );
    }

    await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() },
    });

    // По желание можеш вместо redirect да покажеш „успешно“
    redirect("/login?verified=1");
}
