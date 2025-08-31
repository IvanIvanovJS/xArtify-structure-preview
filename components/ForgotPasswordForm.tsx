'use client'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import Link from "next/link";

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
        <div className="flex-col items-center w-full max-w-md space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl/20 border p-6">
            <article className="flex items-center justify-center gap-10 h-20">

                <h3 className="text-2xl font-bold text-gray-800 underline decoration-1 underline-offset-4 decoration-blue-400">
                    Възстановяване на парола
                </h3>

            </article>

            <div className="text-sm text-center text-gray-700 dark:text-gray-400 h-12">
                Ще изпратим имейл за смяна на Вашата парола{" "}
            </div>





            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col items-center space-y-6 w-full gap-6"
            >
                <div className="w-2/3 flex flex-col space-y-6 gap-6">
                    <div className="relative z-0 w-full group">
                        <input
                            type="email"
                            id="email"
                            className="peer placeholder-transparent block w-full px-4 pt-5 pb-2 h-12 border border-gray-300 rounded-md shadow-sm appearance-none bg-transparent focus:outline-none focus:ring"
                            placeholder=" "
                            {...form.register("email")}
                        />
                        <label
                            htmlFor="email"
                            className={`absolute left-4 top-3 text-gray-400 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 text-base transition-all duration-100 
                peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                peer-focus:-top-3 peer-focus:text-[12px] peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-[12px] 
              `}
                        >
                            Имейл адрес
                        </label>
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                        )}
                        {message && (
                            <div className="text-center text-sm text-green-500 rounded-md">
                                {message}
                            </div>
                        )}
                        {error && (
                            <div className="text-center text-sm text-red-500 rounded-md">
                                {error}
                            </div>
                        )}
                    </div>

                </div>

                <div className="flex flex-row gap-5 items-center w-2/3">
                    <Link className="w-full"
                        href={"/login"}>
                        <button
                            type="submit"
                            className="cursor-pointer w-full px-4 py-2 text-blue-400  h-12 shadow-xl bg-white rounded-md border hover:bg-blue-100 decoration-blue-400"
                        >
                            Назад
                        </button>
                    </Link>

                    <button
                        type="submit"
                        className="cursor-pointer w-full px-4 py-2 text-white  h-12 shadow-xl bg-blue-400 rounded-md hover:bg-blue-500 transition-colors"
                        disabled={form.formState.isSubmitting}>

                        Изпрати
                    </button>
                </div>

            </form>

            <div className="h-10"></div>
        </div>
    );
}
