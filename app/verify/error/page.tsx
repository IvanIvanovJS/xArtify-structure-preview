// ==============================
// app/verify/error/page.tsx (SERVER COMPONENT)
// ==============================
import type { Metadata } from "next";
import Link from "next/link";
import ResendForm from "@/components/ResendForm";

export const metadata: Metadata = {
    title: "Грешка при верификация",
    description: "Неуспешно потвърждение на имейл адрес.",
    robots: { index: false },
};

export default function VerifyErrorPage() {
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

            {/* Клиентският формуляр е отделен компонент */}
            <ResendForm />

            <div className="pt-2">
                <Link href="/" className="text-sm text-neutral-600 underline-offset-4 hover:underline dark:text-neutral-400">
                    Върни се към началото
                </Link>
            </div>
        </section>
    );
}