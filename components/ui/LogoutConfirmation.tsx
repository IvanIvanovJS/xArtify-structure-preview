"use client";

import { JSX } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import "./styles/logout-confirmation.css";

interface LogoutConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LogoutConfirmation({ isOpen, onClose }: LogoutConfirmationProps): JSX.Element {
    const router = useRouter();

    const handleLogout = async (): Promise<void> => {
        try {
            await signOut({
                redirect: false,
                callbackUrl: "/"
            });
            onClose();
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Logout error:", error);
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent): void => {
        if (e.key === "Escape") {
            onClose();
        }
    };

    if (!isOpen) return <></>;

    return (
        <div
            className="logout-overlay"
            onClick={onClose}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
        >
            <div
                className="logout-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="logout-header">
                    <h2 id="logout-title" className="logout-title">
                        Потвърждение за изход
                    </h2>
                </div>

                <div className="logout-content">
                    <p className="logout-message">
                        Сигурни ли сте, че искате да излезете от акаунта си?
                    </p>
                </div>

                <div className="logout-actions">
                    <button
                        type="button"
                        onClick={onClose}
                        className="logout-cancel-btn"
                        aria-label="Отказ от изход"
                    >
                        Отказ
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="logout-confirm-btn"
                        aria-label="Потвърди изход"
                    >
                        Изход
                    </button>
                </div>
            </div>
        </div>
    );
}
