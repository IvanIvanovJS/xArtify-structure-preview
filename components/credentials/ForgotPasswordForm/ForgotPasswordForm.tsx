'use client'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./styles/password.css";

// 1. Дефиниране на схемата за валидация
const formSchema = z.object({
    email: z.string().email({ message: "Моля, въведете валиден имейл." }),
});

export default function ForgotPasswordForm() {
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setMessage(null);
        setError(null);

        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: data.email }),
            });

            const result = await res.json();

            if (!res.ok) {
                setError(result.message || 'Възникна грешка.');
                return;
            }

            setMessage(result.message);
            form.reset();

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Възникна грешка. Моля, опитайте отново.");
            }
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-header-container">
                {/* Logo */}
                <div className="forgot-password-logo">
                    <Image src="/web-logo.svg" width={48} height={48} alt="xArtify Logo" />
                </div>

                {/* Main title */}
                <h1 className="forgot-password-main-title">Забравена парола?</h1>

                {/* Description */}
                <div className="forgot-password-description">
                    Не се притеснявайте! Въведете имейла си и ще изпратим линк за възстановяване на паролата.
                </div>

            </div>

            {error && (<div className="forgot-password-error">{error}</div>)}
            {message && (<div className="forgot-password-success">{message}</div>)}

            {/* Форма за забравена парола */}
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="forgot-password-form"
                autoComplete="on"
            >
                <div className="forgot-password-form-fields">
                    {/* Email поле */}
                    <div className="forgot-password-input-group">
                        <input
                            type="email"
                            id="email"
                            className="forgot-password-input"
                            placeholder=" "
                            {...form.register("email")}
                            autoComplete="email"
                        />
                        <label
                            htmlFor="email"
                            className="forgot-password-label"
                        >
                            Имейл адрес
                        </label>
                        {form.formState.errors.email && (
                            <p className="forgot-password-field-error">{form.formState.errors.email.message}</p>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="forgot-password-buttons">
                    <Link href="/login" className="forgot-password-back-btn">
                        Назад
                    </Link>
                    <input
                        type="submit"
                        value="Изпрати линк"
                        className="forgot-password-submit-btn"
                        disabled={form.formState.isSubmitting}
                    />
                </div>
            </form>

            <div className="forgot-password-footer">
                Ако не получите имейл в рамките на няколко минути, проверете папката &quot;Спам&quot; или{" "}
                <Link href="/contact" className="forgot-password-footer-link">
                    свържете се с нас
                </Link>
            </div>
        </div>
    );
}
