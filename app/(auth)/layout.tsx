"use client";

import { useRouter } from "next/navigation";
import "./styles/auth-layout.css";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const handleBackClick = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push("/");
        }
    };

    return (
        <div className="auth-page-container">
            {/* Back link in top left */}
            <div className="auth-home-container">
                <button
                    onClick={handleBackClick}
                    className="auth-home-link"
                    type="button"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Назад
                </button>
            </div>

            {children}
        </div>
    );
}
