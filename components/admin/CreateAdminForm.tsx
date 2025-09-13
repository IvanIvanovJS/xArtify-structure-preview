"use client";

import { useState } from "react";
import type { FC, ReactElement } from "react";

const CreateAdminForm: FC = (): ReactElement => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        adminKey: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Изчистваме грешката при промяна на полетата
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Валидация на клиентската страна
        if (formData.password !== formData.confirmPassword) {
            setError("Паролите не съвпадат");
            return;
        }

        if (formData.password.length < 8) {
            setError("Паролата трябва да бъде поне 8 символа");
            return;
        }

        if (!formData.email.includes("@")) {
            setError("Невалиден email адрес");
            return;
        }

        if (formData.name.length < 2) {
            setError("Името трябва да бъде поне 2 символа");
            return;
        }

        if (formData.adminKey.length < 10) {
            setError("Admin ключът трябва да бъде поне 10 символа");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("/api/admin/create-admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    adminKey: formData.adminKey
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Грешка при създаване на admin акаунт");
            }

            setSuccess(true);
            setFormData({
                email: "",
                password: "",
                confirmPassword: "",
                name: "",
                adminKey: ""
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестна грешка");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="create-admin-form">
                <div className="create-admin-form__success">
                    <h2>✅ Admin акаунтът беше успешно създаден!</h2>
                    <p>Сега можете да влезете в системата с новия admin акаунт.</p>
                    <a href="/login" className="admin-btn admin-btn--primary">
                        Към входа
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="create-admin-form">
            <div className="create-admin-form__header">
                <h1>Създаване на Admin Акаунт</h1>
                <p>Това е първоначалното създаване на admin акаунт за платформата.</p>
            </div>

            <form onSubmit={handleSubmit} className="create-admin-form__form">
                {error && (
                    <div className="create-admin-form__error">
                        <p>{error}</p>
                    </div>
                )}

                <div className="create-admin-form__field">
                    <label htmlFor="name" className="admin-label">
                        Пълно име *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="admin-input"
                        placeholder="Въведете пълното си име"
                        required
                    />
                </div>

                <div className="create-admin-form__field">
                    <label htmlFor="email" className="admin-label">
                        Email адрес *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="admin-input"
                        placeholder="admin@example.com"
                        required
                    />
                </div>

                <div className="create-admin-form__field">
                    <label htmlFor="password" className="admin-label">
                        Парола *
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="admin-input"
                        placeholder="Минимум 8 символа"
                        required
                    />
                </div>

                <div className="create-admin-form__field">
                    <label htmlFor="confirmPassword" className="admin-label">
                        Потвърди паролата *
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="admin-input"
                        placeholder="Повторете паролата"
                        required
                    />
                </div>

                <div className="create-admin-form__field">
                    <label htmlFor="adminKey" className="admin-label">
                        Admin ключ *
                    </label>
                    <input
                        type="password"
                        id="adminKey"
                        name="adminKey"
                        value={formData.adminKey}
                        onChange={handleInputChange}
                        className="admin-input"
                        placeholder="Въведете admin ключа"
                        required
                    />
                    <p className="create-admin-form__help">
                        Admin ключът се предоставя от разработчика на системата.
                    </p>
                </div>

                <div className="create-admin-form__actions">
                    <button
                        type="submit"
                        disabled={loading}
                        className="admin-btn admin-btn--primary"
                    >
                        {loading ? "Създаване..." : "Създай Admin Акаунт"}
                    </button>
                </div>
            </form>

            <div className="create-admin-form__info">
                <h3>⚠️ Важна информация:</h3>
                <ul>
                    <li>Този процес може да се извърши само веднъж</li>
                    <li>Admin ключът е необходим за сигурност</li>
                    <li>След създаването можете да променяте роли на други потребители</li>
                    <li>Запазете паролата на сигурно място</li>
                </ul>
            </div>
        </div>
    );
};

export default CreateAdminForm;
