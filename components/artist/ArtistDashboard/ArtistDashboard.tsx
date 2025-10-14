// components/artist/ArtistDashboard/ArtistDashboard.tsx
"use client";

import { useState, JSX } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import Image from "next/image";

import "./styles/artist-dashboard.css";

interface DashboardStats {
    overview: {
        totalPaintings: number;
        publishedPaintings: number;
        draftPaintings: number;
        totalCourses: number;
        totalSales: number;
        totalRevenue: number;
        totalCommission: number;
        totalViews: number;
        profileViews: number;
    };
    subscription: {
        plan: {
            name: string;
            displayName: string;
        } | null;
        status: string | null;
        billingCycle: string | null;
        currentPeriodEnd: string | null;
    };
    recentSales: Array<{
        id: string;
        salePrice: number;
        createdAt: string;
        painting: {
            title: string;
            images: string[];
        };
        buyer: {
            name: string | null;
            email: string | null;
        };
    }>;
    period: string;
    startDate: string;
    endDate: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ArtistDashboard(): JSX.Element {
    const [selectedPeriod, setSelectedPeriod] = useState("30d");
    const { data, error, isLoading } = useSWR<DashboardStats>(
        `/api/artist/dashboard?period=${selectedPeriod}`,
        fetcher,
        { refreshInterval: 30000 }
    );

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("bg-BG", {
            style: "currency",
            currency: "BGN",
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString("bg-BG");
    };

    if (error) {
        return (
            <div className="artist-dashboard-error">
                <h2>Грешка при зареждане на данните</h2>
                <p>Моля, опитайте отново по-късно.</p>
            </div>
        );
    }

    return (
        <div className="artist-dashboard">
            <div className="artist-dashboard-header">
                <h1 className="artist-dashboard-title">Dashboard</h1>
                <div className="artist-dashboard-period-selector">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="artist-period-select"
                    >
                        <option value="7d">Последните 7 дни</option>
                        <option value="30d">Последните 30 дни</option>
                        <option value="90d">Последните 90 дни</option>
                        <option value="1y">Последната година</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="artist-dashboard-loading">
                    <div className="artist-spinner"></div>
                    <p>Зареждане на данните...</p>
                </div>
            ) : data && data.overview ? (
                <>
                    {/* Overview Cards */}
                    <div className="artist-dashboard-cards">
                        <motion.div
                            className="artist-dashboard-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="artist-card-icon">🎨</div>
                            <div className="artist-card-content">
                                <h3>Общо картини</h3>
                                <p className="artist-card-number">{data.overview.totalPaintings}</p>
                                <div className="artist-card-breakdown">
                                    <span className="artist-card-published">
                                        {data.overview.publishedPaintings} публикувани
                                    </span>
                                    <span className="artist-card-draft">
                                        {data.overview.draftPaintings} чернови
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="artist-dashboard-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="artist-card-icon">📚</div>
                            <div className="artist-card-content">
                                <h3>Курсове</h3>
                                <p className="artist-card-number">{data.overview.totalCourses}</p>
                                <p className="artist-card-subtitle">Активни курсове</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="artist-dashboard-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="artist-card-icon">💰</div>
                            <div className="artist-card-content">
                                <h3>Продажби</h3>
                                <p className="artist-card-number">{data.overview.totalSales}</p>
                                <p className="artist-card-subtitle">
                                    {formatCurrency(data.overview.totalRevenue)} общо
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="artist-dashboard-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="artist-card-icon">👁️</div>
                            <div className="artist-card-content">
                                <h3>Прегледи</h3>
                                <p className="artist-card-number">{data.overview.totalViews}</p>
                                <p className="artist-card-subtitle">
                                    {data.overview.profileViews} профил
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Subscription Info */}
                    {data.subscription.plan && (
                        <motion.div
                            className="artist-subscription-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="artist-subscription-header">
                                <h3>Абонамент</h3>
                                <span className="artist-plan-badge">
                                    {data.subscription.plan.displayName}
                                </span>
                            </div>
                            <div className="artist-subscription-details">
                                <p>
                                    Статус: <span className="artist-status-active">Активен</span>
                                </p>
                                {data.subscription.currentPeriodEnd && (
                                    <p>
                                        Следващо плащане: {formatDate(data.subscription.currentPeriodEnd)}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Recent Sales */}
                    <motion.div
                        className="artist-recent-sales"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h3>Последни продажби</h3>
                        {data.recentSales.length > 0 ? (
                            <div className="artist-sales-list">
                                {data.recentSales.map((sale) => (
                                    <div key={sale.id} className="artist-sale-item">
                                        <div className="artist-sale-painting">
                                            {sale.painting.images[0] && (
                                                <Image
                                                    src={sale.painting.images[0]}
                                                    alt={sale.painting.title}
                                                    width={48}
                                                    height={48}
                                                    className="artist-sale-image"
                                                />
                                            )}
                                            <div className="artist-sale-details">
                                                <h4>{sale.painting.title}</h4>
                                                <p>{sale.buyer.name || sale.buyer.email}</p>
                                            </div>
                                        </div>
                                        <div className="artist-sale-info">
                                            <p className="artist-sale-price">
                                                {formatCurrency(sale.salePrice)}
                                            </p>
                                            <p className="artist-sale-date">
                                                {formatDate(sale.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="artist-no-sales">Няма продажби за избрания период</p>
                        )}
                    </motion.div>
                </>
            ) : null}
        </div>
    );
}
