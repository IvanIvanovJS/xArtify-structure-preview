// components/RegisterForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 1. Дефиниране на схемата за валидация със Zod
const formSchema = z.object({
    name: z.string().min(2, { message: "Името трябва да бъде поне 2 символа." }),
    email: z.email({ message: "Моля, въведете валиден имейл." }),
    password: z
        .string()
        .min(6, { message: "Паролата трябва да бъде поне 6 символа." }),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
        message: "Трябва да се съгласите с Общите условия.",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Паролите не съвпадат.",
    path: ["confirmPassword"],
});

export default function RegisterForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            terms: false,
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setError(null);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                router.push("/"); // Пренасочваме към страницата за вход
            } else {
                const errorData = await res.json();
                setError(errorData.message);
            }
        } catch (e: any) {
            setError("Възникна грешка при регистрацията.");
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
                Регистрация
            </h2>

            {error && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
                    {error}
                </div>
            )}

            {/* Бутони за социална регистрация */}
            <div className="flex flex-col space-y-2">
                <button
                    onClick={() => signIn("google")}
                    className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                    <img src="/google-icon.svg" alt="Google" className="h-5 w-5 mr-2" />
                    Регистрация с Google
                </button>
                <button
                    onClick={() => signIn("facebook")}
                    className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                    <img src="/facebook-icon.svg" alt="Facebook" className="h-5 w-5 mr-2" />
                    Регистрация с Facebook
                </button>
            </div>

            <div className="relative flex items-center justify-center">
                <span className="absolute left-0 w-full h-px bg-gray-300 dark:bg-gray-600"></span>
                <span className="relative z-10 px-4 text-sm text-gray-500 bg-white dark:bg-gray-800">
                    или
                </span>
            </div>

            {/* Форма за регистрация */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Име
                    </label>
                    <input
                        type="text"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                        <p className="mt-2 text-sm text-red-600">
                            {form.formState.errors.name.message}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Имейл адрес
                    </label>
                    <input
                        type="email"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                        <p className="mt-2 text-sm text-red-600">
                            {form.formState.errors.email.message}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Парола
                    </label>
                    <input
                        type="password"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        {...form.register("password")}
                    />
                    {form.formState.errors.password && (
                        <p className="mt-2 text-sm text-red-600">
                            {form.formState.errors.password.message}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Потвърди паролата
                    </label>
                    <input
                        type="password"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        {...form.register("confirmPassword")}
                    />
                    {form.formState.errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">
                            {form.formState.errors.confirmPassword.message}
                        </p>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        {...form.register("terms")}
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                        Съгласен съм с <Link href="/terms" className="text-blue-600 hover:underline">Общите условия</Link> и <Link href="/privacy" className="text-blue-600 hover:underline">Политиката за поверителност</Link>.
                    </label>
                </div>
                {form.formState.errors.terms && (
                    <p className="mt-2 text-sm text-red-600">
                        {form.formState.errors.terms.message}
                    </p>
                )}
                <button
                    type="submit"
                    className="w-full px-4 py-2 text-white font-semibold bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    disabled={form.formState.isSubmitting}
                >
                    Регистрация
                </button>
            </form>
            <div className="text-sm text-center text-gray-700 dark:text-gray-400">
                Вече имате регистрация?{" "}
                <Link href="/login"> <button className="font-medium text-blue-600 hover:underline">
                    Вход</button>
                </Link>
            </div>
        </div>
    );
}