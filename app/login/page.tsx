// app/login/page.tsx
import LoginForm from "@/components/credentials/LoginForm/LoginForm";

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-6">
            <LoginForm />
        </div>
    );
}