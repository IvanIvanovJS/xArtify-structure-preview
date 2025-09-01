// ========================================
// app/verify/error/page.tsx
// ========================================
"use client";
import type { Metadata } from "next";
import Link from "next/link";
import { useState } from "react";

export const metadata: Metadata = {
    title: "Грешка при верификация",
    description: "Неуспешно потвърждение на имейл адрес.",
    robots: { index: false },
};

export default function VerifyErrorPage() {
    const [email, setEmail] = useState<string>("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState<string>("");

    async function onResend(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!email) return;
        try {
            setStatus("loading");
            setMessage("");
            // Имплементирайте /api/resend-verification (POST { email })
            const res = await fetch("/api/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error("Request failed");
            setStatus("success");
            setMessage("Изпратихме нов линк за потвърждение, провери пощата си.");
        } catch {
            setStatus("error");
            setMessage("Възникна грешка. Моля, опитайте отново по-късно.");
        }
    }

    return (
        <section aria-labelledby="verify-error-title" className="space-y-4">
            <div className="flex items-start gap-3">
                <div className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600/10">
                    <span className="text-red-600">!</span>
                </div>
                <div>
                    <h2 id="verify-error-title" className="text-lg font-semibold">Грешка при верификация</h2>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        Линкът е невалиден или изтекъл. Можеш да поискаш нов имейл за потвърждение.
                    </p>
                </div>
            </div>

            <form onSubmit={onResend} className="space-y-3">
                <label className="block text-sm font-medium" htmlFor="email">Имейл адрес</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-black dark:border-neutral-800 dark:bg-neutral-950"
                />
                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60 dark:border-neutral-800"
                >
                    {status === "loading" ? "Изпращане..." : "Изпрати нов линк"}
                </button>
                {message && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>
                )}
            </form>

            <div className="pt-2">
                <Link href="/" className="text-sm text-neutral-600 underline-offset-4 hover:underline dark:text-neutral-400">
                    Върни се към началото
                </Link>
            </div>
        </section>
    );
}
