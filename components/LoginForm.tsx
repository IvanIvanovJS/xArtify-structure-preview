// components/LoginForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// 1. Дефиниране на схемата за валидация
const formSchema = z.object({
    email: z.string().email({ message: "Моля, въведете валиден имейл." }),
    password: z
        .string()
        .min(1, { message: "Паролата е задължителна." }), // Паролата не може да е празна
});

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    const [rememberMe, setRememberMe] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setError(null);
        const callbackUrl = searchParams.get("callbackUrl") || "/";

        // Предаваме състоянието на отметката на функцията signIn
        const res = await signIn("credentials", {
            // За да обработим ние сами пренасочването
            email: data.email,
            password: data.password,
            callbackUrl,
            remember_me: rememberMe, // Добавено!
        });

        if (res?.error) {
            form.setError("password", {
                type: "manual",
                message: "Невалиден имейл или парола."
            });
        } else {
            router.push(callbackUrl);
        }

    };
    const spacer = <div className="h-4"></div>;
    const passwordValue = form.watch("password");

    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword((v) => !v);
    };


    return (
        <div className="flex-col items-center w-full max-w-md space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl/20 border p-6">

            <article className="flex items-center justify-center gap-10 h-20">
                <h3 className="text-2xl font-bold text-gray-800 underline decoration-1 underline-offset-4 decoration-blue-400">
                    Вход
                </h3>
                <Link href="/register" >
                    <button className="cursor-pointer text-2xl text-gray-400 hover:text-gray-500 hover:underline decoration-1 underline-offset-4">
                        Регистрация
                    </button>
                </Link>
            </article>

            {error && (<div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>
            )}

            {/* Добавяме autocomplete="on" за да подканим браузъра да запази данните */}
            <form
                onSubmit={(e) => {
                    form.handleSubmit(onSubmit)(e)
                }}
                className="flex flex-col items-center space-y-0 w-full gap-4"
                autoComplete="on"
            >
                <div className="w-2/3 flex flex-col space-y-6 gap-4">
                    {/* Email поле */}
                    <div className="relative z-0 w-full group">
                        <input
                            type="email"
                            id="email"
                            className="peer placeholder-transparent block w-full px-4 pt-5 pb-2 h-12 border border-gray-300 rounded-md shadow-sm appearance-none bg-transparent focus:outline-none focus:ring"
                            placeholder=" "
                            {...form.register("email")}
                            // Добавяме autocomplete="email" за по-добра съвместимост с браузърите
                            autoComplete="username"
                        />
                        <label
                            htmlFor="email"
                            className={`absolute left-4 top-3 text-gray-400 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 text-base transition-all duration-100 
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                  peer-focus:-top-3  peer-focus:text-[12px] peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-[12px] 
                  `}
                        >
                            Имейл
                        </label>
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                        )}
                    </div>

                    {/* Поле за парола с бутон за показване/скриване */}
                    <div className="relative z-0 w-full group">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className="peer block w-full px-4 pt-5 pb-2 h-12 border border-gray-300 rounded-md shadow-sm appearance-none bg-transparent focus:outline-none focus:ring"
                            placeholder=" "
                            {...form.register("password")}
                            // Добавяме autocomplete="current-password"
                            autoComplete="current-password"
                            onBlur={() => setShowPassword(false)}
                        />
                        <label
                            htmlFor="password"
                            className={`absolute left-4 top-3 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 text-base transition-all duration-100 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3 ${passwordValue ? "peer-valid:-top-3 peer-valid:text-[12px]" : ""
                                } peer-focus:text-[12px]`}
                        >
                            Парола
                        </label>
                        {/* Бутон с икона око */}
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-7 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            aria-label={showPassword ? "Скрий паролата" : "Покажи паролата"}
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                // Икона закрито око
                                <img src="/hide-password.svg" className="h-5 w-5" />

                            ) : (
                                // Икона отворено око
                                <img src="/eye-outline.svg" className="h-5 w-5" />
                            )}
                        </button>
                        <div className="w-full flex justify-center items-center gap-14">
                            <div className="flex items-center gap-2">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-200">
                                    Запомни ме
                                </label>
                            </div>

                            <Link
                                href="/forgotten-password">
                                <span
                                    className="cursor-pointer text-sm text-blue-500 hover:underline">Забравена парола?
                                </span>
                            </Link>
                        </div>

                        {form.formState.errors.password && (
                            <p className="text-sm text-red-600 mt-1">{form.formState.errors.password.message}</p>
                        )}
                    </div>

                    {/* Отметка за "Запомни ме" */}

                </div>

                <button
                    type="submit"
                    className="cursor-pointer w-2/3 px-4 py-2 text-white font-semibold h-12 shadow-xl bg-blue-400 rounded-md hover:bg-blue-500 transition-colors"
                    disabled={form.formState.isSubmitting}
                >
                    Вход
                </button>
            </form>

            <div className="relative flex items-center justify-center h-14">
                <span className="relative left-0 w-2/3 h-px bg-gray-300 dark:bg-gray-600"></span>
                <span className="absolute z-10 px-4 text-sm text-gray-500 bg-white dark:bg-gray-800">или</span>
            </div>

            {/* Бутони за социален вход */}
            <div className="flex flex-col items-center space-y-6 gap-4">
                <button
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                    className="cursor-pointer gap-2 h-12 flex items-center justify-center w-2/3 py-2 px-4 border-b-3 hover:bg-gray-200 border-gray-300 rounded-full text-sm font-medium transition-colors"
                >
                    <img src="/google-icon.svg" alt="Google" className="h-8 w-8 mr-5" />
                    Вход с Google
                </button>
                <button
                    onClick={() => signIn("facebook", { callbackUrl: "/" })}
                    className="cursor-pointer gap-2 h-12 flex items-center justify-center w-2/3 py-2 px-4 border-b-3 hover:bg-gray-200 border-gray-300 rounded-full text-sm font-medium transition-colors"
                >
                    <img src="/facebook-icon.svg" alt="Facebook" className="h-8 w-8 mr-2 box-" />
                    Вход с Facebook
                </button>
            </div>

            {spacer}

            <div className="text-sm text-center text-gray-700 dark:text-gray-400 h-8">
                Все още нямате профил?{" "}
                <Link href="/register">
                    <button className="cursor-pointer font-medium text-blue-500 hover:underline">Регистрация</button>
                </Link>
            </div>
        </div>
    );
}
