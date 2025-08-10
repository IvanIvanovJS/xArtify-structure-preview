// app/forgotten-password/page.tsx
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgottenPasswordPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900">
            <ForgotPasswordForm />
        </div>
    );
}