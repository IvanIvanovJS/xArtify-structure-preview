// app/register/page.tsx
import RegisterForm from "@/components/credentials/RegisterForm/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
    return (
        <div className="register-page-container">
            {/* Home link in top left */}
            <div className="register-home-container">
                <Link href="/" className="register-home-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Home
                </Link>
            </div>

            <RegisterForm />
        </div>
    );
}