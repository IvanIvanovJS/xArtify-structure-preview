// ========================================
// app/verify/success/page.tsx
// ========================================
import type { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
    title: "Имейлът е потвърден",
    description: "Успешно потвърждение на имейл адрес.",
    robots: { index: false },
};


export default function VerifySuccessPage() {
    return (
        <section aria-labelledby="verify-success-title" className="space-y-4">
            <div className="flex items-start gap-3">
                <div className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-600/10">
                    <span className="text-green-600">✓</span>
                </div>
                <div>
                    <h2 id="verify-success-title" className="text-lg font-semibold">Имейлът е потвърден</h2>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        Благодарим! Вашият имейл адрес беше успешно верифициран. Вече можете да използвате всички функционалности на акаунта си.
                    </p>
                </div>
            </div>


            <div className="flex gap-3 pt-2">
                <Link href="/login" className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-black dark:border-neutral-800">
                    Продължи към вход
                </Link>
                <Link href="/" className="inline-flex items-center justify-center rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900">
                    Към начало
                </Link>
            </div>
        </section>
    );
}