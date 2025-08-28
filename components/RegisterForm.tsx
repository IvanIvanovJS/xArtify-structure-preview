// components/RegisterForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// схема за валидация
const formSchema = z
    .object({
        name: z.string().min(2, { message: "Името трябва да бъде поне 2 символа." }),
        email: z.string().email({ message: "Моля, въведете валиден имейл." }),
        password: z.string().min(6, { message: "Паролата трябва да бъде поне 6 символа." }),
        confirmPassword: z.string(),
        terms: z.boolean().refine((val) => val === true, {
            message: "Трябва да се съгласите с Общите условия.",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
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

    const passwordValue = form.watch("password");
    const confirmValue = form.watch("confirmPassword");
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((v) => !v);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setError(null);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                router.push("/");
                return; // може да пренасочиш и към логин
            }
            const errorData = await res.json();

            if (errorData?.field === "email") {
                form.setError("email", {
                    type: "server",
                    message: errorData?.message || "Имейлът вече е зает.",
                });
            } else {
                setError(errorData?.message || "Грешка при регистрацията.");
            }


        } catch (error) {
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError("Възникна грешка при регистрацията.");
            }

        }
    };

    const spacer = <div className="h-4" />;

    return (
        <div className="flex-col items-center w-full max-w-md space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl/20 border p-6">

            <article className="flex items-center justify-center gap-10 h-20">
                <Link href="/login">
                    <button className="cursor-pointer text-2xl text-gray-400 hover:text-gray-500 hover:underline decoration-1 underline-offset-4">
                        Вход
                    </button>
                </Link>
                <h3 className="text-2xl font-bold text-gray-800 underline decoration-1 underline-offset-4 decoration-blue-400">
                    Регистрация
                </h3>

            </article>






            {/* Форма - направена като LoginForm (ширина и floating labels) */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center space-y-6 w-full gap-4">
                <div className="w-2/3 flex flex-col space-y-6 gap-4">
                    {/* Име */}
                    <div className="relative z-0 w-full group">
                        <input
                            id="name"
                            placeholder=" "
                            className="peer placeholder-transparent block w-full px-4 pt-5 pb-2 h-12 border border-gray-300 rounded-md shadow-sm appearance-none bg-transparent focus:outline-none focus:ring"
                            {...form.register("name")}
                        />
                        <label
                            htmlFor="name"
                            className="absolute left-4 top-3 text-gray-400 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 text-base transition-all duration-100 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-3 peer-focus:text-[12px] peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-[12px]"
                        >
                            Име
                        </label>
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="relative z-0 w-full group">
                        <input
                            id="email"
                            placeholder=" "
                            className="peer placeholder-transparent block w-full px-4 pt-5 pb-2 h-12 border border-gray-300 rounded-md shadow-sm appearance-none bg-transparent focus:outline-none focus:ring"
                            {...form.register("email")}
                        />
                        <label
                            htmlFor="email"
                            className="absolute left-4 top-3 text-gray-400 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 text-base transition-all duration-100 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-3 peer-focus:text-[12px] peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-[12px]"
                        >
                            Имейл адрес
                        </label>
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                        )}
                    </div>
                    {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
                    {/* Парола */}
                    <div className="relative z-0 w-full group">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder=" "
                            className="peer block w-full px-4 pt-5 pb-2 h-12 border border-gray-300 rounded-md shadow-sm appearance-none bg-transparent focus:outline-none focus:ring"
                            {...form.register("password")}
                        />
                        <label
                            htmlFor="password"
                            className={`absolute left-4 top-3 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 text-base transition-all duration-100 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-3 ${passwordValue ? "peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-[12px]" : ""} peer-focus:text-[12px]`}
                        >
                            Парола
                        </label>

                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
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

                    {/* Потвърди паролата */}
                    <div className="relative z-0 w-full group">
                        <input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder=" "
                            className="peer block w-full px-4 pt-5 pb-2 h-12 border border-gray-300 rounded-md shadow-sm appearance-none bg-transparent focus:outline-none focus:ring"
                            {...form.register("confirmPassword")}
                        />
                        <label
                            htmlFor="confirmPassword"
                            className={`absolute left-4 top-3 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 text-base transition-all duration-100 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-3 ${confirmValue ? "peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-[12px]" : ""} peer-focus:text-[12px]`}
                        >
                            Потвърди паролата
                        </label>
                        {form.formState.errors.confirmPassword && (
                            <p className="text-sm text-red-600 mt-1">{form.formState.errors.confirmPassword.message}</p>
                        )}
                    </div>


                    {/* Terms checkbox (в една линия с полето) */}
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" {...form.register("terms")} />
                        <label className="text-sm text-gray-700 dark:text-gray-300">
                            Съгласен съм с <Link href="/terms" className="text-blue-600 hover:underline">Общите условия</Link> и <Link href="/privacy" className="text-blue-600 hover:underline">Политиката за поверителност</Link>.
                        </label>
                    </div>

                    {form.formState.errors.terms && <p className="text-sm text-red-600 mt-1">{form.formState.errors.terms.message}</p>}
                </div>

                {/* Submit бутон (като в LoginForm) */}
                <button
                    type="submit"
                    className="cursor-pointer w-2/3 px-4 py-2 text-white font-semibold h-12 shadow-xl bg-blue-400 rounded-md hover:bg-blue-500 transition-colors"
                    disabled={form.formState.isSubmitting}
                >
                    Регистрация
                </button>
            </form>

            <div className="relative flex items-center justify-center h-14">
                <span className="relative left-0 w-2/3 h-px bg-gray-300 dark:bg-gray-600"></span>
                <span className="absolute z-10 px-4 text-sm text-gray-500 bg-white dark:bg-gray-800">или</span>
            </div>
            {/* Социални регистрации (стил като в LoginForm) */}
            <div className="flex flex-col items-center space-y-6 gap-4 w-full">
                <button
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                    className="cursor-pointer gap-2 h-12 flex items-center justify-center w-2/3 py-2 px-4 border-b-3 hover:bg-gray-200 border-gray-300 rounded-full text-sm font-medium transition-colors"
                    type="button"
                >
                    <Image src="/google-icon.svg" alt="Google" className="h-8 w-8 mr-5" />
                    Регистрация с Google
                </button>

                <button
                    onClick={() => signIn("facebook", { callbackUrl: "/" })}
                    className="cursor-pointer gap-2 h-12 flex items-center justify-center w-2/3 py-2 px-4 border-b-3 hover:bg-gray-200 border-gray-300 rounded-full text-sm font-medium transition-colors"
                    type="button"
                >
                    <Image src="/facebook-icon.svg" alt="Facebook" className="h-8 w-8 mr-2" />
                    Регистрация с Facebook
                </button>
            </div>
            {spacer}
            {/* Връзка към вход (подобно на LoginForm footer) */}
            <div className="text-sm text-center text-gray-700 dark:text-gray-400 h-8">
                Вече имате регистрация?{" "}
                <Link href="/login">
                    <button className="cursor-pointer font-medium text-blue-500 hover:underline">Вход</button>
                </Link>
            </div>
        </div>
    );
}
