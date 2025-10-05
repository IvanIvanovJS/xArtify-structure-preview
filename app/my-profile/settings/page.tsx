"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Save, Trash2, Eye, EyeOff } from "lucide-react";
import { JSX } from "react";

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

export default function SettingsPage(): JSX.Element {
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
            <div className="profile-dashboard__loading">
                <div className="loading-spinner"></div>
                <p>Зареждане на настройките...</p>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="profile-dashboard__error">
                <p>Грешка при зареждане на данните</p>
            </div>
        );
    }

    return (
        <div>
            <div className="profile-dashboard__page-header">
                <h1 className="profile-dashboard__page-title">Настройки</h1>
                <p className="profile-dashboard__page-description">
                    Управлявайте информацията за вашия профил и акаунт
                </p>
            </div>

            {error && (
                <div className="profile-dashboard__error">
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="profile-dashboard__success">
                    <p>{success}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="profile-dashboard__form">
                {/* Profile Image Section */}
                <div className="profile-dashboard__avatar-section">
                    <Image
                        src={userData.image || "/default-avatar.svg"}
                        alt="Profile Picture"
                        width={80}
                        height={80}
                        className="profile-dashboard__avatar"
                    />
                    <div className="profile-dashboard__avatar-actions">
                        <div className="profile-dashboard__avatar-upload">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={saving}
                            />
                            <button
                                type="button"
                                className="profile-dashboard__btn profile-dashboard__btn--secondary profile-dashboard__btn--small"
                                disabled={saving}
                            >
                                <Camera size={16} />
                                Смени снимка
                            </button>
                        </div>
                        <p className="profile-dashboard__form-help">
                            JPG, PNG до 5MB
                        </p>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="profile-dashboard__form-group">
                    <label htmlFor="name" className="profile-dashboard__form-label">
                        Име
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="profile-dashboard__form-input"
                        placeholder="Въведете вашето име"
                        disabled={saving}
                    />
                    {formErrors.name && (
                        <p className="profile-dashboard__form-error">{formErrors.name}</p>
                    )}
                </div>

                <div className="profile-dashboard__form-group">
                    <label htmlFor="email" className="profile-dashboard__form-label">
                        Имейл
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="profile-dashboard__form-input"
                        placeholder="Въведете вашия имейл"
                        disabled={saving}
                    />
                    {formErrors.email && (
                        <p className="profile-dashboard__form-error">{formErrors.email}</p>
                    )}
                </div>

                {/* Password Change Section */}
                <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--color-primary-10)" }}>
                    <h3 style={{ color: "var(--color-foreground)", marginBottom: "1rem" }}>
                        Смяна на парола
                    </h3>
                    <p className="profile-dashboard__form-help" style={{ marginBottom: "1.5rem" }}>
                        Оставете празно, ако не искате да смените паролата
                    </p>

                    <div className="profile-dashboard__form-group">
                        <label htmlFor="currentPassword" className="profile-dashboard__form-label">
                            Текуща парола
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                className="profile-dashboard__form-input"
                                placeholder="Въведете текущата парола"
                                disabled={saving}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility("current")}
                                style={{
                                    position: "absolute",
                                    right: "0.75rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "var(--color-muted-foreground)",
                                    cursor: "pointer",
                                    padding: "0.25rem"
                                }}
                            >
                                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {formErrors.currentPassword && (
                            <p className="profile-dashboard__form-error">{formErrors.currentPassword}</p>
                        )}
                    </div>

                    <div className="profile-dashboard__form-group">
                        <label htmlFor="newPassword" className="profile-dashboard__form-label">
                            Нова парола
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                className="profile-dashboard__form-input"
                                placeholder="Въведете новата парола"
                                disabled={saving}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility("new")}
                                style={{
                                    position: "absolute",
                                    right: "0.75rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "var(--color-muted-foreground)",
                                    cursor: "pointer",
                                    padding: "0.25rem"
                                }}
                            >
                                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {formErrors.newPassword && (
                            <p className="profile-dashboard__form-error">{formErrors.newPassword}</p>
                        )}
                    </div>

                    <div className="profile-dashboard__form-group">
                        <label htmlFor="confirmPassword" className="profile-dashboard__form-label">
                            Потвърди новата парола
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="profile-dashboard__form-input"
                                placeholder="Потвърдете новата парола"
                                disabled={saving}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility("confirm")}
                                style={{
                                    position: "absolute",
                                    right: "0.75rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "var(--color-muted-foreground)",
                                    cursor: "pointer",
                                    padding: "0.25rem"
                                }}
                            >
                                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {formErrors.confirmPassword && (
                            <p className="profile-dashboard__form-error">{formErrors.confirmPassword}</p>
                        )}
                    </div>
                </div>

                <div className="profile-dashboard__form-actions">
                    <button
                        type="submit"
                        className="profile-dashboard__btn profile-dashboard__btn--primary"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="loading-spinner" style={{ width: "16px", height: "16px", border: "2px solid var(--color-primary-20)", borderLeft: "2px solid var(--color-primary-foreground)" }}></div>
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
            <div className="profile-dashboard__danger-zone">
                <h3>Опасна зона</h3>
                <p>
                    Изтриването на акаунта е необратимо. Всички ваши данни, картини и курсове ще бъдат изтрити завинаги.
                </p>

                {!showDeleteConfirm ? (
                    <button
                        type="button"
                        className="profile-dashboard__btn profile-dashboard__btn--danger"
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        <Trash2 size={16} />
                        Изтрий акаунта
                    </button>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}>
                        <p style={{ color: "#ef4444", fontWeight: "600" }}>
                            ВНИМАНИЕ: Това действие е необратимо!
                        </p>
                        <div>
                            <label htmlFor="deletePassword" className="profile-dashboard__form-label">
                                Въведете паролата си за потвърждение
                            </label>
                            <input
                                type="password"
                                id="deletePassword"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="profile-dashboard__form-input"
                                placeholder="Въведете паролата си"
                                disabled={deleting}
                            />
                        </div>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button
                                type="button"
                                className="profile-dashboard__btn profile-dashboard__btn--danger"
                                onClick={handleDeleteAccount}
                                disabled={deleting || !deletePassword.trim()}
                            >
                                {deleting ? (
                                    <>
                                        <div className="loading-spinner" style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderLeft: "2px solid white" }}></div>
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
                                className="profile-dashboard__btn profile-dashboard__btn--secondary"
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
