"use client";

import { useState, useEffect, JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import Image from "next/image";

import "./styles/artist-settings.css";

interface ArtistSettingsData {
    profile: {
        id: string;
        bio: string | null;
        website: string | null;
        instagram: string | null;
        facebook: string | null;
        twitter: string | null;
        location: string | null;
        specialties: string[];
        experience: string | null;
        education: string | null;
        awards: string | null;
        user: {
            name: string | null;
            email: string | null;
            image: string | null;
        };
    };
    notifications: {
        emailNotifications: boolean;
        saleNotifications: boolean;
        messageNotifications: boolean;
        marketingEmails: boolean;
    };
}

interface UpdateProfileData {
    bio?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    location?: string;
    specialties?: string[];
    experience?: string;
    education?: string;
    awards?: string;
}

interface UpdateNotificationsData {
    emailNotifications?: boolean;
    saleNotifications?: boolean;
    messageNotifications?: boolean;
    marketingEmails?: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ArtistSettings(): JSX.Element {
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'account'>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Profile form state
    const [profileForm, setProfileForm] = useState<UpdateProfileData>({});

    // Notifications form state
    const [notificationsForm, setNotificationsForm] = useState<UpdateNotificationsData>({});

    const { data, error, mutate } = useSWR<ArtistSettingsData>('/api/artist/settings', fetcher);

    useEffect(() => {
        if (data && data.profile && data.notifications) {
            setProfileForm({
                bio: data.profile.bio || '',
                website: data.profile.website || '',
                instagram: data.profile.instagram || '',
                facebook: data.profile.facebook || '',
                twitter: data.profile.twitter || '',
                location: data.profile.location || '',
                specialties: data.profile.specialties || [],
                experience: data.profile.experience || '',
                education: data.profile.education || '',
                awards: data.profile.awards || ''
            });

            setNotificationsForm({
                emailNotifications: data.notifications.emailNotifications,
                saleNotifications: data.notifications.saleNotifications,
                messageNotifications: data.notifications.messageNotifications,
                marketingEmails: data.notifications.marketingEmails
            });
        }
    }, [data]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/artist/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileForm)
            });

            if (response.ok) {
                showMessage('success', 'Профилът е обновен успешно!');
                mutate();
            } else {
                const error = await response.json();
                showMessage('error', error.message || 'Грешка при обновяване на профила.');
            }
        } catch (error) {
            showMessage('error', 'Възникна грешка при обновяване на профила.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotificationsUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/artist/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notificationsForm)
            });

            if (response.ok) {
                showMessage('success', 'Настройките за известия са обновени!');
                mutate();
            } else {
                const error = await response.json();
                showMessage('error', error.message || 'Грешка при обновяване на настройките.');
            }
        } catch (error) {
            showMessage('error', 'Възникна грешка при обновяване на настройките.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSpecialtyAdd = (specialty: string) => {
        if (specialty.trim() && !profileForm.specialties?.includes(specialty.trim())) {
            setProfileForm(prev => ({
                ...prev,
                specialties: [...(prev.specialties || []), specialty.trim()]
            }));
        }
    };

    const handleSpecialtyRemove = (index: number) => {
        setProfileForm(prev => ({
            ...prev,
            specialties: prev.specialties?.filter((_, i) => i !== index) || []
        }));
    };

    if (error) {
        return (
            <div className="settings-error">
                <h2>Грешка при зареждане на настройките</h2>
                <p>Моля, опитайте отново по-късно.</p>
            </div>
        );
    }

    if (!data || !data.profile || !data.notifications) {
        return (
            <div className="settings-loading">
                <div className="settings-spinner"></div>
                <p>Зареждане на настройките...</p>
            </div>
        );
    }

    return (
        <div className="artist-settings">
            <div className="settings-header">
                <h1>Настройки</h1>
                <p>Управлявайте профила и предпочитанията си</p>
            </div>

            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`settings-message ${message.type}`}
                    >
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="settings-tabs">
                <button
                    className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Профил
                </button>
                <button
                    className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    Известия
                </button>
                <button
                    className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
                    onClick={() => setActiveTab('account')}
                >
                    Акаунт
                </button>
            </div>

            <div className="settings-content">
                <AnimatePresence mode="wait">
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="settings-panel"
                        >
                            <h2>Профилна информация</h2>
                            <form onSubmit={handleProfileUpdate} className="settings-form">
                                <div className="form-group">
                                    <label htmlFor="bio">Биография</label>
                                    <textarea
                                        id="bio"
                                        value={profileForm.bio || ''}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                                        placeholder="Разкажете за себе си и творчеството си..."
                                        rows={4}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="website">Уебсайт</label>
                                        <input
                                            type="url"
                                            id="website"
                                            value={profileForm.website || ''}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                                            placeholder="https://yourwebsite.com"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="location">Местоположение</label>
                                        <input
                                            type="text"
                                            id="location"
                                            value={profileForm.location || ''}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                                            placeholder="София, България"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="instagram">Instagram</label>
                                        <input
                                            type="text"
                                            id="instagram"
                                            value={profileForm.instagram || ''}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, instagram: e.target.value }))}
                                            placeholder="@username"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="facebook">Facebook</label>
                                        <input
                                            type="text"
                                            id="facebook"
                                            value={profileForm.facebook || ''}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, facebook: e.target.value }))}
                                            placeholder="facebook.com/username"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="twitter">Twitter</label>
                                    <input
                                        type="text"
                                        id="twitter"
                                        value={profileForm.twitter || ''}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, twitter: e.target.value }))}
                                        placeholder="@username"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Специализации</label>
                                    <div className="specialties-container">
                                        {profileForm.specialties?.map((specialty, index) => (
                                            <span key={index} className="specialty-tag">
                                                {specialty}
                                                <button
                                                    type="button"
                                                    onClick={() => handleSpecialtyRemove(index)}
                                                    className="specialty-remove"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            placeholder="Добавете специализация..."
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleSpecialtyAdd(e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="experience">Опит</label>
                                    <textarea
                                        id="experience"
                                        value={profileForm.experience || ''}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, experience: e.target.value }))}
                                        placeholder="Опишете професионалния си опит..."
                                        rows={3}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="education">Образование</label>
                                    <textarea
                                        id="education"
                                        value={profileForm.education || ''}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, education: e.target.value }))}
                                        placeholder="Образованието и квалификациите ви..."
                                        rows={3}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="awards">Награди и признания</label>
                                    <textarea
                                        id="awards"
                                        value={profileForm.awards || ''}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, awards: e.target.value }))}
                                        placeholder="Награди, изложби, признания..."
                                        rows={3}
                                    />
                                </div>

                                <button type="submit" disabled={isLoading} className="settings-save-btn">
                                    {isLoading ? 'Запазване...' : 'Запази промените'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div
                            key="notifications"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="settings-panel"
                        >
                            <h2>Настройки за известия</h2>
                            <form onSubmit={handleNotificationsUpdate} className="settings-form">
                                <div className="notification-group">
                                    <h3>Имейл известия</h3>

                                    <div className="notification-item">
                                        <div className="notification-info">
                                            <h4>Общи известия</h4>
                                            <p>Получавайте важни съобщения за платформата</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notificationsForm.emailNotifications || false}
                                                onChange={(e) => setNotificationsForm(prev => ({
                                                    ...prev,
                                                    emailNotifications: e.target.checked
                                                }))}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="notification-item">
                                        <div className="notification-info">
                                            <h4>Известия за продажби</h4>
                                            <p>Получавайте известия когато някой купи ваша картина</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notificationsForm.saleNotifications || false}
                                                onChange={(e) => setNotificationsForm(prev => ({
                                                    ...prev,
                                                    saleNotifications: e.target.checked
                                                }))}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="notification-item">
                                        <div className="notification-info">
                                            <h4>Известия за съобщения</h4>
                                            <p>Получавайте известия за нови съобщения</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notificationsForm.messageNotifications || false}
                                                onChange={(e) => setNotificationsForm(prev => ({
                                                    ...prev,
                                                    messageNotifications: e.target.checked
                                                }))}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="notification-item">
                                        <div className="notification-info">
                                            <h4>Маркетингови имейли</h4>
                                            <p>Получавайте съвети и актуализации за платформата</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notificationsForm.marketingEmails || false}
                                                onChange={(e) => setNotificationsForm(prev => ({
                                                    ...prev,
                                                    marketingEmails: e.target.checked
                                                }))}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>

                                <button type="submit" disabled={isLoading} className="settings-save-btn">
                                    {isLoading ? 'Запазване...' : 'Запази настройките'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'account' && (
                        <motion.div
                            key="account"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="settings-panel"
                        >
                            <h2>Информация за акаунта</h2>

                            <div className="account-info">
                                <div className="account-avatar">
                                    {data.profile.user.image ? (
                                        <Image
                                            src={data.profile.user.image}
                                            alt={data.profile.user.name || 'Профил'}
                                            width={80}
                                            height={80}
                                            className="avatar-image"
                                        />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {data.profile.user.name?.charAt(0).toUpperCase() || 'A'}
                                        </div>
                                    )}
                                </div>

                                <div className="account-details">
                                    <h3>{data.profile.user.name}</h3>
                                    <p>{data.profile.user.email}</p>
                                    <span className="account-role">Артист</span>
                                </div>
                            </div>

                            <div className="account-actions">
                                <button className="account-btn primary">
                                    Промени паролата
                                </button>
                                <button className="account-btn secondary">
                                    Промени имейла
                                </button>
                                <button className="account-btn danger">
                                    Изтрий акаунта
                                </button>
                            </div>

                            <div className="account-stats">
                                <h3>Статистики</h3>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <span className="stat-label">Регистриран на</span>
                                        <span className="stat-value">Януари 2024</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Последна активност</span>
                                        <span className="stat-value">Днес</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
