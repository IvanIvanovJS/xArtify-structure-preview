"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// 1. Дефиниране на схемата за валидация на новата парола
const formSchema = z.object({
    password: z
        .string()
        .min(8, { message: "Паролата трябва да е поне 8 символа." })
        .regex(/[A-Z]/, { message: "Паролата трябва да съдържа поне една главна буква." })
        .regex(/[a-z]/, { message: "Паролата трябва да съдържа поне една малка буква." })
        .regex(/[0-9]/, { message: "Паролата трябва да съдържа поне едно число." }),
    confirmPassword: z.string().min(1, { message: "Моля, потвърдете паролата." }),
}).refine(data => data.password === data.confirmPassword, {
    message: "Паролите не съвпадат.",
    path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

export default function ResetPasswordForm({ token }: { token: string }) {
    const router = useRouter();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: FormData) => {
        setMessage(null);
        setError(null);

        try {
            const res = await fetch(`/api/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password: data.password }),
            });

            const result = await res.json();

            if (!res.ok) {
                setError(result.message || 'Възникна грешка.');
                return;
            }

            setMessage(result.message);
            form.reset();
            router.push('/login'); // Пренасочване към вход след успешна смяна

        } catch (error) {
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError("Възникна грешка.Моля опитайте отново.");
            }
        }
    };

    const passwordValue = form.watch("password");
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword((v) => !v);
    };

    return (
        <div className="flex-col items-center w-full max-w-md space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl/20 border p-6">
            <article className="flex items-center justify-center gap-10 h-20">
                <h3 className="text-2xl font-bold text-gray-800 underline decoration-1 underline-offset-4 decoration-blue-400">
                    Смяна на парола
                </h3>
            </article>



            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col items-center space-y-6 w-full gap-6"
            >
                <div className="w-2/3 flex flex-col space-y-6 gap-6">
                    <div className="relative z-0 w-full group">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className="peer block w-full px-4 pt-5 pb-2 h-12 border border-gray-300 rounded-md shadow-sm appearance-none bg-transparent focus:outline-none focus:ring"
                            placeholder=" "
                            {...form.register("password")}
                        />
                        <label
                            htmlFor="password"
                            className={`absolute left-4 top-3 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 text-base transition-all duration-100 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3 ${passwordValue ? "peer-valid:-top-3 peer-valid:text-[12px]" : ""}`}
                        >
                            Нова парола
                        </label>
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-6 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            aria-label={showPassword ? "Скрий паролата" : "Покажи паролата"}
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <Image src="/hide-password.svg" className="h-5 w-5" alt="hide" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                        {form.formState.errors.password && (
                            <p className="text-sm text-red-600 mt-1">{form.formState.errors.password.message}</p>
                        )}
                    </div>
                    <div className="relative z-0 w-full group">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="confirmPassword"
                            className="peer block w-full px-4 pt-5 pb-2 h-12 border border-gray-300 rounded-md shadow-sm appearance-none bg-transparent focus:outline-none focus:ring"
                            placeholder=" "
                            {...form.register("confirmPassword")}
                        />
                        <label
                            htmlFor="confirmPassword"
                            className={`absolute left-4 top-3 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 text-base transition-all duration-100 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3 ${form.watch("confirmPassword") ? "peer-valid:-top-3 peer-valid:text-[12px]" : ""}`}
                        >
                            Потвърдете паролата
                        </label>
                        {form.formState.errors.confirmPassword && (
                            <p className="text-sm text-red-600 mt-1">{form.formState.errors.confirmPassword.message}</p>
                        )}
                    </div>
                    {message && (
                        <div className="p-3 text-sm text-center text-green-700 rounded-md">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="p-3 text-sm text-center text-red-700 rounded-md">
                            {error}
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className="cursor-pointer w-2/3 px-4 py-2 text-white font-semibold h-12 shadow-xl bg-blue-400 rounded-md hover:bg-blue-500 transition-colors"
                    disabled={form.formState.isSubmitting}
                >
                    Смяна на парола
                </button>
            </form>
            <div className="h-10"></div>
        </div>
    );
}
