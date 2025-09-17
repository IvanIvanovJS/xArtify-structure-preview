// app/login/page.tsx
import LoginForm from "@/components/credentials/LoginForm/LoginForm";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="login-page-container">
            {/* Home link in top left */}
            <div className="login-home-container">
                <Link href="/" className="login-home-link">
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