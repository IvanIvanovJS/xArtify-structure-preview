// app/register/page.tsx
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-6 bg-gray-100 dark:bg-gray-900">
            <RegisterForm />
        </div>
    );
}