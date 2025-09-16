// app/login/page.tsx
import LoginForm from "@/components/credentials/LoginForm/LoginForm";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-start pt-4 md:pt-8 md:justify-center">
            {/* Home link in top left */}
            <div className="absolute top-4 left-4 md:top-8 md:left-12 z-20">
                <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Home
                </Link>
            </div>

            <LoginForm />
        </div>
    );
}