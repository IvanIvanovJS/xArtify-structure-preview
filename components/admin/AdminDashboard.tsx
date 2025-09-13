"use client";

import { useState, useEffect } from "react";
import type { FC, ReactElement } from "react";

interface AdminStats {
    overview: {
        totalUsers: number;
        totalArtists: number;
        totalAdmins: number;
        totalPaintings: number;
        totalCourses: number;
        totalEnrollments: number;
        totalRevenue: number;
        averagePaintingPrice: number;
        completionRate: number;
    };
    recent: {
        users: Array<{
            id: string;
            email: string;
            name: string;
            role: string;
            createdAt: string;
        }>;
        paintings: Array<{
            id: string;
            title: string;
            price: number;
            createdAt: string;
            artist: {
                user: {
                    name: string;
                    email: string;
                };
            };
        }>;
    };
    roleStats: Array<{
        role: string;
        count: number;
    }>;
    monthlyStats: Array<{
        month: string;
        count: number;
        type: string;
    }>;
}

const AdminDashboard: FC = (): ReactElement => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/api/admin/stats");
                if (!response.ok) {
                    throw new Error("Грешка при зареждане на статистиките");
                }
                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Неизвестна грешка");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="admin-dashboard__loading">
                    <div className="loading-spinner"></div>
                    <p>Зареждане на статистики...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="admin-dashboard__error">
                    <h2>Грешка</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="admin-btn admin-btn--primary"
                    >
                        Опитай отново
                    </button>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="admin-dashboard">
                <div className="admin-dashboard__error">
                    <h2>Няма данни</h2>
                    <p>Не бяха намерени статистики</p>
                </div>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bg-BG", {
            style: "currency",
            currency: "BGN"
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("bg-BG", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-dashboard__header">
                <h1>Admin Dashboard</h1>
                <p>Общ преглед на платформата</p>
            </div>

            {/* Overview Cards */}
            <div className="admin-dashboard__overview">
                <div className="admin-card">
                    <div className="admin-card__icon">👥</div>
                    <div className="admin-card__content">
                        <h3>Общо потребители</h3>
                        <p className="admin-card__number">{stats.overview.totalUsers}</p>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card__icon">🎨</div>
                    <div className="admin-card__content">
                        <h3>Художници</h3>
                        <p className="admin-card__number">{stats.overview.totalArtists}</p>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card__icon">🖼️</div>
                    <div className="admin-card__content">
                        <h3>Картини</h3>
                        <p className="admin-card__number">{stats.overview.totalPaintings}</p>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card__icon">📚</div>
                    <div className="admin-card__content">
                        <h3>Курсове</h3>
                        <p className="admin-card__number">{stats.overview.totalCourses}</p>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card__icon">💰</div>
                    <div className="admin-card__content">
                        <h3>Общ приход</h3>
                        <p className="admin-card__number">{formatCurrency(stats.overview.totalRevenue)}</p>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card__icon">📈</div>
                    <div className="admin-card__content">
                        <h3>Завършени курсове</h3>
                        <p className="admin-card__number">{stats.overview.completionRate}%</p>
                    </div>
                </div>
            </div>

            {/* Role Statistics */}
            <div className="admin-dashboard__section">
                <h2>Статистики по роли</h2>
                <div className="admin-role-stats">
                    {stats.roleStats.map((stat) => (
                        <div key={stat.role} className="admin-role-stat">
                            <span className="admin-role-stat__role">{stat.role}</span>
                            <span className="admin-role-stat__count">{stat.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="admin-dashboard__section">
                <h2>Последна активност</h2>
                <div className="admin-recent-activity">
                    <div className="admin-recent-activity__column">
                        <h3>Последни потребители</h3>
                        <div className="admin-recent-list">
                            {stats.recent.users.map((user) => (
                                <div key={user.id} className="admin-recent-item">
                                    <div className="admin-recent-item__info">
                                        <span className="admin-recent-item__name">
                                            {user.name || user.email}
                                        </span>
                                        <span className="admin-recent-item__role admin-role-badge admin-role-badge--{user.role.toLowerCase()}">
                                            {user.role}
                                        </span>
                                    </div>
                                    <span className="admin-recent-item__date">
                                        {formatDate(user.createdAt)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="admin-recent-activity__column">
                        <h3>Последни картини</h3>
                        <div className="admin-recent-list">
                            {stats.recent.paintings.map((painting) => (
                                <div key={painting.id} className="admin-recent-item">
                                    <div className="admin-recent-item__info">
                                        <span className="admin-recent-item__name">
                                            {painting.title}
                                        </span>
                                        <span className="admin-recent-item__artist">
                                            от {painting.artist.user.name || painting.artist.user.email}
                                        </span>
                                    </div>
                                    <div className="admin-recent-item__details">
                                        <span className="admin-recent-item__price">
                                            {formatCurrency(painting.price)}
                                        </span>
                                        <span className="admin-recent-item__date">
                                            {formatDate(painting.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
