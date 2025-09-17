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
import { EyeIcon } from "@/components/ui/EyeIcon";
import { EyeOffIcon } from "@/components/ui/EyeOffIcon";
import "./styles/register.css";

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

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const togglePasswordVisibility = () => setShowPassword((v) => !v);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((v) => !v);

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

    return (
        <div className="register-container">
            <div className="register-header-container">
                {/* Logo */}
                <div className="register-logo">
                    <Image src="/web-logo.svg" width={48} height={48} alt="xArtify Logo" />
                </div>

                {/* Main title */}
                <h1 className="register-main-title">Регистрация в xArtify</h1>

                {/* Sign in link */}
                <div className="register-signin-text">
                    Вече имате акаунт? <Link href="/login" className="register-signin-link">Вход</Link>
                </div>
            </div>

            {error && (<div className="register-error">{error}</div>)}

            {/* Бутони за социална регистрация */}
            <div className="register-social-container">
                <div
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                    className="register-social-btn"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            signIn("google", { callbackUrl: "/" });
                        }
                    }}
                >
                    <Image src="/google-icon.svg" width={8} height={8} alt="Google" className="register-social-icon" />
                    Регистрация с Google
                </div>
                <div
                    onClick={() => signIn("facebook", { callbackUrl: "/" })}
                    className="register-social-btn"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            signIn("facebook", { callbackUrl: "/" });
                        }
                    }}
                >
                    <Image src="/facebook-icon.svg" width={8} height={8} alt="Facebook" className="register-social-icon" />
                    Регистрация с Facebook
                </div>
            </div>

            <div className="register-divider">
                <span className="register-divider-left"></span>
                <span className="register-divider-text">или</span>
                <span className="register-divider-right"></span>
            </div>

            {/* Форма за регистрация */}
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="register-form"
                autoComplete="on"
            >
                <div className="register-form-fields">
                    {/* Име поле */}
                    <div className="register-input-group">
                        <input
                            type="text"
                            id="name"
                            className="register-input"
                            placeholder=" "
                            {...form.register("name")}
                            autoComplete="name"
                        />
                        <label
                            htmlFor="name"
                            className="register-label"
                        >
                            Име
                        </label>
                        {form.formState.errors.name && (
                            <p className="register-field-error">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    {/* Email поле */}
                    <div className="register-input-group">
                        <input
                            type="email"
                            id="email"
                            className="register-input"
                            placeholder=" "
                            {...form.register("email")}
                            autoComplete="email"
                        />
                        <label
                            htmlFor="email"
                            className="register-label"
                        >
                            Имейл
                        </label>
                        {form.formState.errors.email && (
                            <p className="register-field-error">{form.formState.errors.email.message}</p>
                        )}
                    </div>

                    {/* Поле за парола */}
                    <div className="register-input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className="register-input"
                            placeholder=" "
                            {...form.register("password")}
                            autoComplete="new-password"
                            onBlur={() => setShowPassword(false)}
                        />
                        <label
                            htmlFor="password"
                            className="register-label"
                        >
                            Парола
                        </label>
                        {/* Бутон с икона око */}
                        <div
                            onClick={togglePasswordVisibility}
                            className="register-password-toggle"
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
                                <EyeOffIcon
                                    size={20}
                                    color="rgba(255, 255, 255, 0.6)"
                                    className="h-5 w-5"
                                />
                            ) : (
                                <EyeIcon
                                    size={20}
                                    color="rgba(255, 255, 255, 0.6)"
                                    className="h-5 w-5"
                                />
                            )}
                        </div>
                        {form.formState.errors.password && (
                            <p className="register-field-error">{form.formState.errors.password.message}</p>
                        )}
                    </div>

                    {/* Поле за потвърждение на паролата */}
                    <div className="register-input-group">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            className="register-input"
                            placeholder=" "
                            {...form.register("confirmPassword")}
                            autoComplete="new-password"
                            onBlur={() => setShowConfirmPassword(false)}
                        />
                        <label
                            htmlFor="confirmPassword"
                            className="register-label"
                        >
                            Потвърди паролата
                        </label>
                        {/* Бутон с икона око */}
                        <div
                            onClick={toggleConfirmPasswordVisibility}
                            className="register-password-toggle"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    toggleConfirmPasswordVisibility();
                                }
                            }}
                            aria-label={showConfirmPassword ? "Скрий паролата" : "Покажи паролата"}
                        >
                            {showConfirmPassword ? (
                                <EyeOffIcon
                                    size={20}
                                    color="rgba(255, 255, 255, 0.6)"
                                    className="h-5 w-5"
                                />
                            ) : (
                                <EyeIcon
                                    size={20}
                                    color="rgba(255, 255, 255, 0.6)"
                                    className="h-5 w-5"
                                />
                            )}
                        </div>
                        {form.formState.errors.confirmPassword && (
                            <p className="register-field-error">{form.formState.errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {/* Terms checkbox */}
                    <div className="register-terms">
                        <input
                            id="terms"
                            type="checkbox"
                            className="register-checkbox"
                            {...form.register("terms")}
                        />
                        <label htmlFor="terms" className="register-terms-label">
                            Съгласен съм с <Link href="/terms" className="register-terms-link">Общите условия</Link> и <Link href="/privacy" className="register-terms-link">Политиката за поверителност</Link>.
                        </label>
                    </div>
                    {form.formState.errors.terms && (
                        <p className="register-field-error">{form.formState.errors.terms.message}</p>
                    )}
                </div>

                <input
                    type="submit"
                    value="Регистрация"
                    className="register-submit-btn"
                    disabled={form.formState.isSubmitting}
                />
            </form>

            <div className="register-footer">
                При регистрация се съгласявате с{" "}
                <Link href="/terms" className="register-footer-link">
                    Общи условия
                </Link>
                {" "}и <Link href="/privacy" className="register-footer-link">
                    Политика за поверителност
                </Link>
            </div>
        </div>
    );
}
