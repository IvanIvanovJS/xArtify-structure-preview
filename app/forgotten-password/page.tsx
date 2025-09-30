// app/forgotten-password/page.tsx
import ForgotPasswordForm from "@/components/credentials/ForgotPasswordForm/ForgotPasswordForm";
import Link from "next/link";

export default function ForgottenPasswordPage() {
    return (
        <div className="forgot-password-page-container">
            {/* Home link in top left */}
            <div className="forgot-password-home-container">
                <Link href="/" className="forgot-password-home-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Начало
                </Link>
            </div>

            <ForgotPasswordForm />
        </div>
    );
}