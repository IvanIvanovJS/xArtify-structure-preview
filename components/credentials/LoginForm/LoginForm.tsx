// components/LoginForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { EyeIcon } from "@/components/ui/EyeIcon";
import { EyeOffIcon } from "@/components/ui/EyeOffIcon";
import ErrorHandler from "./ErrorHandler";


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

    const handleOAuthSignIn = async (provider: "google" | "facebook"): Promise<void> => {
        setError(null);
        const callbackUrl = searchParams.get("callbackUrl") || "/";

        try {
            const res = await signIn(provider, {
                callbackUrl,
                redirect: false
            });

            if (res?.error) {
                setError("Възникна грешка при вход с " + (provider === "google" ? "Google" : "Facebook") + ". Моля, опитайте отново.");
            } else if (res?.ok) {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (error) {
            console.error("OAuth sign-in error:", error);
            setError("Възникна грешка при вход с " + (provider === "google" ? "Google" : "Facebook") + ". Моля, опитайте отново.");
        }
    };

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
            redirect: false
        });

        if (res?.error) {
            form.setError("password", {
                type: "manual",
                message: "Невалиден имейл или парола."
            });
        } else if (res?.ok) {
            router.push(callbackUrl);
            router.refresh();
        }

    };

    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword((v) => !v);
    };


    return (
        <div className="login-container">
            <ErrorHandler onError={setError} />
            <div className="login-header-container">
                {/* Logo */}
                <div className="login-logo">
                    <Image src="/web-logo.svg" width={48} height={48} alt="xArtify Logo" />
                </div>

                {/* Main title */}
                <h1 className="login-main-title">Влез в xArtify</h1>

                {/* Sign up link */}
                <div className="login-signup-text">
                    Нямате акаунт? <Link href="/register" className="login-signup-link">Регистрация</Link>
                </div>
            </div>


            {error && (<div className="login-error">{error}</div>
            )}

            {/* Бутони за социален вход */}
            <div className="login-social-container">
                <div
                    onClick={() => handleOAuthSignIn("google")}
                    className="login-social-btn"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOAuthSignIn("google");
                        }
                    }}
                >
                    <Image src="/google-icon.svg" width={8} height={8} alt="Google" className="login-social-icon" />
                    Вход с Google
                </div>
                <div
                    onClick={() => handleOAuthSignIn("facebook")}
                    className="login-social-btn"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOAuthSignIn("facebook");
                        }
                    }}
                >
                    <Image src="/facebook-icon.svg" width={8} height={8} alt="Facebook" className="login-social-icon" />
                    Вход с Facebook
                </div>
            </div>

            <div className="login-divider">
                <span className="login-divider-left"></span>
                <span className="login-divider-text">или</span>
                <span className="login-divider-right"></span>
            </div>

            {/* Добавяме autocomplete="on" за да подканим браузъра да запази данните */}
            <form
                onSubmit={(e) => {
                    form.handleSubmit(onSubmit)(e)
                }}
                className="login-form"
                autoComplete="on"
            >
                <div className="login-form-fields">
                    {/* Email поле */}
                    <div className="login-input-group">
                        <input
                            type="email"
                            id="email"
                            className="login-input"
                            placeholder=" "
                            {...form.register("email")}
                            // Добавяме autocomplete="email" за по-добра съвместимост с браузърите
                            autoComplete="username"
                        />
                        <label
                            htmlFor="email"
                            className="login-label"
                        >
                            Имейл
                        </label>
                        {form.formState.errors.email && (
                            <p className="login-field-error">{form.formState.errors.email.message}</p>
                        )}
                    </div>

                    {/* Поле за парола с бутон за показване/скриване */}
                    <div className="login-input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className="login-input"
                            placeholder=" "
                            {...form.register("password")}
                            // Добавяме autocomplete="current-password"
                            autoComplete="current-password"
                            onBlur={() => setShowPassword(false)}
                        />
                        <label
                            htmlFor="password"
                            className="login-label"
                        >
                            Парола
                        </label>
                        {/* Бутон с икона око */}
                        <div
                            onClick={togglePasswordVisibility}
                            className="login-password-toggle"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    togglePasswordVisibility();
                                }
                            }}
                            aria-label={showPassword ? "Скрий паролата" : "Покажи паролата"}
                        >
                            {showPassword ? (
                                // Икона закрито око
                                <EyeOffIcon
                                    size={20}
                                    color="rgba(255, 255, 255, 0.6)"
                                    className="h-5 w-5"
                                />
                            ) : (
                                // Икона отворено око
                                <EyeIcon
                                    size={20}
                                    color="rgba(255, 255, 255, 0.6)"
                                    className="h-5 w-5"
                                />
                            )}
                        </div>
                        <div className="login-options">
                            <div className="login-remember">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="login-checkbox"
                                />
                                <label htmlFor="remember-me" className="login-remember-label">
                                    Запомни ме
                                </label>
                            </div>

                            <Link
                                href="/forgotten-password"
                                className="login-forgot-link">
                                Забравена парола?
                            </Link>
                        </div>

                        {form.formState.errors.password && (
                            <p className="login-field-error">{form.formState.errors.password.message}</p>
                        )}
                    </div>

                    {/* Отметка за "Запомни ме" */}

                </div>

                <input
                    type="submit"
                    value="Вход"
                    className="login-submit-btn"
                    disabled={form.formState.isSubmitting}
                />
            </form>




            <div className="login-footer">
                При вход се съгласявате с{" "}
                <Link href="/terms" className="login-footer-link">
                    Общи условия
                </Link>
                {" "}и <Link href="/privacy" className="login-footer-link">
                    Политика за поверителност
                </Link>
            </div>
        </div>
    );
}
