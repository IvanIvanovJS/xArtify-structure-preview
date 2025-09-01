import type { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
    title: "Email Verification",
    robots: { index: false },
};


export default function VerifyLayout(
    { children }: { children: React.ReactNode }
) {
    return (
        <main className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Потвърждение на имейл</h1>
                    <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">Начало</Link>
                </div>
                {children}
            </div>
        </main>
    );
}