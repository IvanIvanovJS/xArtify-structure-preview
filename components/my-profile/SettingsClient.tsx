"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Save, Trash2, Eye, EyeOff } from "lucide-react";
import { JSX } from "react";
import "./styles/settings.css";

interface UserData {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
}

interface FormData {
    name: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
}

export default function SettingsClient(): JSX.Element {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleting, setDeleting] = useState(false);

    const router = useRouter();

    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await fetch("/api/profile");
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            const data: UserData = await response.json();
            setUserData(data);
            setFormData({
                name: data.name || "",
                email: data.email || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (err) {
            setError("Грешка при зареждане на данните");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (formErrors[name as keyof FormErrors]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        if (!formData.name.trim()) {
            errors.name = "Името е задължително";
        }

        if (!formData.email.trim()) {
            errors.email = "Имейлът е задължителен";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Невалиден имейл адрес";
        }

        // Only validate passwords if any password field is filled
        if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
            if (!formData.currentPassword) {
                errors.currentPassword = "Текущата парола е задължителна";
            }

            if (!formData.newPassword) {
                errors.newPassword = "Новата парола е задължителна";
            } else if (formData.newPassword.length < 6) {
                errors.newPassword = "Паролата трябва да бъде поне 6 символа";
            }

            if (formData.newPassword !== formData.confirmPassword) {
                errors.confirmPassword = "Паролите не съвпадат";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch("/api/profile/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    currentPassword: formData.currentPassword || undefined,
                    newPassword: formData.newPassword || undefined
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Грешка при обновяване на профила");
            }

            setSuccess("Профилът е обновен успешно");

            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            }));

            // Refresh user data
            await fetchUserData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Възникна неочаквана грешка");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError("Моля изберете валиден файл с изображение");
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError("Файлът трябва да бъде по-малък от 5MB");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch("/api/profile/upload-image", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Грешка при качване на изображението");
            }

            setSuccess("Снимката на профила е обновена успешно");
            await fetchUserData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Възникна неочаквана грешка");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword.trim()) {
            setError("Моля въведете паролата си за потвърждение");
            return;
        }

        setDeleting(true);
        setError(null);

        try {
            const response = await fetch("/api/profile/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password: deletePassword }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Грешка при изтриване на акаунта");
            }

            // Redirect to home page after successful deletion
            router.push("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Възникна неочаквана грешка");
        } finally {
            setDeleting(false);
        }
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    if (loading) {
        return (
            <div className="settings__loading">
                <div className="loading-spinner"></div>
                <p>Зареждане на настройките...</p>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="settings__error">
                <p>Грешка при зареждане на данните</p>
            </div>
        );
    }

    return (
        <div>
            <div className="settings__page-header">
                <h1 className="settings__page-title">Настройки</h1>
                <p className="settings__page-description">
                    Управлявайте информацията за вашия профил и акаунт
                </p>
            </div>

            {error && (
                <div className="settings__error">
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="settings__success">
                    <p>{success}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="settings__form">
                {/* Profile Image Section */}
                <div className="settings__avatar-section">
                    <Image
                        src={userData.image || "/default-avatar.svg"}
                        alt="Profile Picture"
                        width={80}
                        height={80}
                        className="settings__avatar"
                    />
                    <div className="settings__avatar-actions">
                        <div className="settings__avatar-upload">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={saving}
                            />
                            <button
                                type="button"
                                className="settings__btn settings__btn--secondary settings__btn--small"
                                disabled={saving}
                            >
                                <Camera size={16} />
                                Смени снимка
                            </button>
                        </div>
                        <p className="settings__form-help">
                            JPG, PNG до 5MB
                        </p>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="settings__form-group">
                    <label htmlFor="name" className="settings__form-label">
                        Име
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="settings__form-input"
                        placeholder="Въведете вашето име"
                        disabled={saving}
                    />
                    {formErrors.name && (
                        <p className="settings__form-error">{formErrors.name}</p>
                    )}
                </div>

                <div className="settings__form-group">
                    <label htmlFor="email" className="settings__form-label">
                        Имейл
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="settings__form-input"
                        placeholder="Въведете вашия имейл"
                        disabled={saving}
                    />
                    {formErrors.email && (
                        <p className="settings__form-error">{formErrors.email}</p>
                    )}
                </div>

                {/* Password Change Section */}
                <div className="settings__password-section">
                    <h3 className="settings__password-title">
                        Смяна на парола
                    </h3>
                    <p className="settings__form-help settings__password-help">
                        Оставете празно, ако не искате да смените паролата
                    </p>

                    <div className="settings__form-group">
                        <label htmlFor="currentPassword" className="settings__form-label">
                            Текуща парола
                        </label>
                        <div className="settings__password-input-wrapper">
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                className="settings__form-input"
                                placeholder="Въведете текущата парола"
                                disabled={saving}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility("current")}
                                className="settings__password-toggle"
                            >
                                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {formErrors.currentPassword && (
                            <p className="settings__form-error">{formErrors.currentPassword}</p>
                        )}
                    </div>

                    <div className="settings__form-group">
                        <label htmlFor="newPassword" className="settings__form-label">
                            Нова парола
                        </label>
                        <div className="settings__password-input-wrapper">
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                className="settings__form-input"
                                placeholder="Въведете новата парола"
                                disabled={saving}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility("new")}
                                className="settings__password-toggle"
                            >
                                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {formErrors.newPassword && (
                            <p className="settings__form-error">{formErrors.newPassword}</p>
                        )}
                    </div>

                    <div className="settings__form-group">
                        <label htmlFor="confirmPassword" className="settings__form-label">
                            Потвърди новата парола
                        </label>
                        <div className="settings__password-input-wrapper">
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="settings__form-input"
                                placeholder="Потвърдете новата парола"
                                disabled={saving}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility("confirm")}
                                className="settings__password-toggle"
                            >
                                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {formErrors.confirmPassword && (
                            <p className="settings__form-error">{formErrors.confirmPassword}</p>
                        )}
                    </div>
                </div>

                <div className="settings__form-actions">
                    <button
                        type="submit"
                        className="settings__btn settings__btn--primary"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="loading-spinner settings__loading-spinner"></div>
                                Запазване...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Запази промените
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Danger Zone */}
            <div className="settings__danger-zone">
                <h3>Опасна зона</h3>
                <p>
                    Изтриването на акаунта е необратимо. Всички ваши данни, картини и курсове ще бъдат изтрити завинаги.
                </p>

                {!showDeleteConfirm ? (
                    <button
                        type="button"
                        className="settings__btn settings__btn--danger"
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        <Trash2 size={16} />
                        Изтрий акаунта
                    </button>
                ) : (
                    <div className="settings__delete-confirmation">
                        <p className="settings__delete-warning">
                            ВНИМАНИЕ: Това действие е необратимо!
                        </p>
                        <div>
                            <label htmlFor="deletePassword" className="settings__form-label">
                                Въведете паролата си за потвърждение
                            </label>
                            <input
                                type="password"
                                id="deletePassword"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="settings__form-input"
                                placeholder="Въведете паролата си"
                                disabled={deleting}
                            />
                        </div>
                        <div className="settings__delete-actions">
                            <button
                                type="button"
                                className="settings__btn settings__btn--danger"
                                onClick={handleDeleteAccount}
                                disabled={deleting || !deletePassword.trim()}
                            >
                                {deleting ? (
                                    <>
                                        <div className="loading-spinner settings__loading-spinner--danger"></div>
                                        Изтриване...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Потвърди изтриването
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="settings__btn settings__btn--secondary"
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeletePassword("");
                                }}
                                disabled={deleting}
                            >
                                Отказ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
