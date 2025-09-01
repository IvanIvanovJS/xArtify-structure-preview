// ==============================
// app/verify/error/ResendForm.tsx (CLIENT COMPONENT)
// ==============================
"use client";
import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function ResendForm({ defaultEmail = "" }: { defaultEmail?: string }) {
    const [email, setEmail] = useState<string>(defaultEmail);
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState<string>("");

    async function onResend(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!email) return;
        try {
            setStatus("loading");
            setMessage("");
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
        <form onSubmit={onResend} className="space-y-3" noValidate>
            <label className="block text-sm font-medium" htmlFor="email">Имейл адрес</label>
            <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-black dark:border-neutral-800 dark:bg-neutral-950"
                aria-describedby="email-help"
            />
            <p id="email-help" className="text-xs text-neutral-500">Ще изпратим нов линк за потвърждение, ако има акаунт с този имейл.</p>

            <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60 dark:border-neutral-800"
                aria-live="polite"
            >
                {status === "loading" ? "Изпращане..." : "Изпрати нов линк"}
            </button>

            {message && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>
            )}
        </form>
    );
}
