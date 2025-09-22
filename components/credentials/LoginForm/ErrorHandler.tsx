"use client";

import { JSX, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface ErrorHandlerProps {
    onError: (error: string) => void;
}

export default function ErrorHandler({ onError }: ErrorHandlerProps): JSX.Element {
    const searchParams = useSearchParams();

    useEffect(() => {
        const error = searchParams.get("error");

        if (error) {
            let errorMessage = "";

            switch (error) {
                case "CredentialsSignin":
                    errorMessage = "Невалиден имейл или парола. Моля, опитайте отново.";
                    break;
                case "Callback":
                    errorMessage = "Възникна грешка при вход с социална мрежа. Моля, опитайте отново.";
                    break;
                case "OAuthSignin":
                    errorMessage = "Грешка при вход с социална мрежа. Моля, опитайте отново.";
                    break;
                case "OAuthCallback":
                    errorMessage = "Грешка при обработка на данните от социалната мрежа.";
                    break;
                case "OAuthCreateAccount":
                    errorMessage = "Не може да се създаде акаунт с тази социална мрежа.";
                    break;
                case "EmailCreateAccount":
                    errorMessage = "Не може да се създаде акаунт с този имейл.";
                    break;
                case "Callback":
                    errorMessage = "Грешка при обработка на заявката. Моля, опитайте отново.";
                    break;
                case "OAuthAccountNotLinked":
                    errorMessage = "Този имейл е свързан с друг акаунт. Моля, използвайте друг начин за вход.";
                    break;
                case "EmailSignin":
                    errorMessage = "Грешка при изпращане на имейл за потвърждение.";
                    break;
                case "CredentialsSignin":
                    errorMessage = "Невалиден имейл или парола.";
                    break;
                case "SessionRequired":
                    errorMessage = "Моля, влезте в акаунта си за да достъпите тази страница.";
                    break;
                default:
                    errorMessage = "Възникна неочаквана грешка. Моля, опитайте отново.";
                    break;
            }

            onError(errorMessage);

            // Премахваме error параметъра от URL-а
            const url = new URL(window.location.href);
            url.searchParams.delete("error");
            window.history.replaceState({}, "", url.toString());
        }
    }, [searchParams, onError]);

    return <></>;
}
