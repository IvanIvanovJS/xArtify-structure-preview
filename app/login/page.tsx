// app/login/page.tsx
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900">
            <LoginForm />
        </div>
    );
}