"use client";

import { useState, useEffect } from "react";
import type { FC, ReactElement } from "react";
import { ChevronDown, ChevronUp, Users, TrendingUp, DollarSign, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import "./styles/subscription-management.css";

interface SubscriptionWithDetails {
    id: string;
    status: string;
    billingCycle: string;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    cancelledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    plan: {
        id: string;
        name: string;
        displayName: string;
        monthlyPrice: number;
        yearlyPrice: number;
        maxActivePaintings: number;
        commissionRate: number;
    };
    artist: {
        id: string;
        user: {
            id: string;
            name: string | null;
            email: string | null;
            createdAt: Date;
        };
    };
}

interface SubscriptionAnalytics {
    totalSubscriptions: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    expiredSubscriptions: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    averageSubscriptionValue: number;
    churnRate: number;
    totalRevenue: number;
    totalPayments: number;
    averagePaymentAmount: number;
    planDistribution: Array<{
        planName: string;
        count: number;
        percentage: number;
    }>;
    monthlyTrends: Array<{
        month: string;
        newSubscriptions: number;
        cancellations: number;
        revenue: number;
    }>;
    topPayingUsers: Array<{
        userId: string;
        userName: string | null;
        userEmail: string | null;
        totalPaid: number;
        paymentCount: number;
    }>;
}

interface SubscriptionManagementProps {
    onSubscriptionUpdated?: () => void;
}

const SubscriptionManagement: FC<SubscriptionManagementProps> = ({ onSubscriptionUpdated }): ReactElement => {
    const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
    const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [planFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedSubscriptions, setExpandedSubscriptions] = useState<Set<string>>(new Set());
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionWithDetails | null>(null);
    const [actionType, setActionType] = useState<"cancel" | "reactivate" | "expire">("cancel");
    const [actionReason, setActionReason] = useState("");

    const fetchSubscriptions = async (page: number = 1, search: string = "", status: string = "", planId: string = "") => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                analytics: "true",
                ...(search && { search }),
                ...(status && { status }),
                ...(planId && { planId })
            });

            const response = await fetch(`/api/admin/subscriptions?${params}`);
            if (!response.ok) {
                throw new Error("Грешка при зареждане на абонаменти");
            }

            const data = await response.json();
            setSubscriptions(data.subscriptions);
            setAnalytics(data.analytics);
            setTotalPages(data.pagination.totalPages);
            setCurrentPage(data.pagination.page);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестна грешка");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions(currentPage, searchTerm, statusFilter, planFilter);
    }, [currentPage, searchTerm, statusFilter, planFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchSubscriptions(1, searchTerm, statusFilter, planFilter);
    };

    const toggleExpanded = (subscriptionId: string) => {
        const newExpanded = new Set(expandedSubscriptions);
        if (newExpanded.has(subscriptionId)) {
            newExpanded.delete(subscriptionId);
        } else {
            newExpanded.add(subscriptionId);
        }
        setExpandedSubscriptions(newExpanded);
    };

    const handleSubscriptionAction = async () => {
        if (!selectedSubscription || !actionReason.trim()) return;

        try {
            setActionLoading(selectedSubscription.id);
            const response = await fetch("/api/admin/subscriptions", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    subscriptionId: selectedSubscription.id,
                    action: actionType,
                    reason: actionReason.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Грешка при изпълнение на действието");
            }

            // Refresh subscriptions
            await fetchSubscriptions(currentPage, searchTerm, statusFilter, planFilter);

            // Close modal
            setShowActionModal(false);
            setSelectedSubscription(null);
            setActionReason("");
            setActionType("cancel");

            // Call callback if provided
            if (onSubscriptionUpdated) {
                onSubscriptionUpdated();
            }

            alert(data.message || "Действието беше успешно изпълнено");

        } catch (err) {
            alert(err instanceof Error ? err.message : "Неизвестна грешка");
        } finally {
            setActionLoading(null);
        }
    };

    const openActionModal = (subscription: SubscriptionWithDetails, action: "cancel" | "reactivate" | "expire") => {
        setSelectedSubscription(subscription);
        setActionType(action);
        setShowActionModal(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bg-BG", {
            style: "currency",
            currency: "BGN"
        }).format(amount);
    };

    const formatDate = (dateString: Date | string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("bg-BG", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active": return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
            case "expired": return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            case "past_due": return <Clock className="w-4 h-4 text-yellow-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "admin-status-badge--active";
            case "cancelled": return "admin-status-badge--cancelled";
            case "expired": return "admin-status-badge--expired";
            case "past_due": return "admin-status-badge--past-due";
            default: return "admin-status-badge--pending";
        }
    };

    if (loading && subscriptions.length === 0) {
        return (
            <div className="subscription-management">
                <div className="subscription-management__loading">
                    <div className="loading-spinner"></div>
                    <p>Зареждане на абонаменти...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="subscription-management">
            <div className="subscription-management__header">
                <h1>Управление на абонаменти</h1>
                <p>Проследяване и управление на абонаменти на артисти</p>
            </div>

            {/* Analytics Toggle */}
            <div className="subscription-management__analytics-toggle">
                <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="admin-btn admin-btn--secondary"
                >
                    {showAnalytics ? "Скрий аналитика" : "Покажи аналитика"}
                    {showAnalytics ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                </button>
            </div>

            {/* Analytics Section */}
            {showAnalytics && analytics && (
                <div className="subscription-management__analytics">
                    <div className="admin-analytics-grid">
                        <div className="admin-analytics-card">
                            <div className="admin-analytics-card__icon">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="admin-analytics-card__content">
                                <h3>Общо абонаменти</h3>
                                <p className="admin-analytics-card__number">{analytics.totalSubscriptions}</p>
                            </div>
                        </div>

                        <div className="admin-analytics-card">
                            <div className="admin-analytics-card__icon">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>
                            <div className="admin-analytics-card__content">
                                <h3>Активни</h3>
                                <p className="admin-analytics-card__number">{analytics.activeSubscriptions}</p>
                            </div>
                        </div>

                        <div className="admin-analytics-card">
                            <div className="admin-analytics-card__icon">
                                <DollarSign className="w-6 h-6 text-green-500" />
                            </div>
                            <div className="admin-analytics-card__content">
                                <h3>Месечен приход</h3>
                                <p className="admin-analytics-card__number">{formatCurrency(analytics.monthlyRevenue)}</p>
                            </div>
                        </div>

                        <div className="admin-analytics-card">
                            <div className="admin-analytics-card__icon">
                                <TrendingUp className="w-6 h-6 text-blue-500" />
                            </div>
                            <div className="admin-analytics-card__content">
                                <h3>Годишен приход</h3>
                                <p className="admin-analytics-card__number">{formatCurrency(analytics.yearlyRevenue)}</p>
                            </div>
                        </div>

                        <div className="admin-analytics-card">
                            <div className="admin-analytics-card__icon">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <div className="admin-analytics-card__content">
                                <h3>Отпадане</h3>
                                <p className="admin-analytics-card__number">{analytics.churnRate.toFixed(1)}%</p>
                            </div>
                        </div>

                        <div className="admin-analytics-card">
                            <div className="admin-analytics-card__icon">
                                <DollarSign className="w-6 h-6 text-purple-500" />
                            </div>
                            <div className="admin-analytics-card__content">
                                <h3>Средна стойност</h3>
                                <p className="admin-analytics-card__number">{formatCurrency(analytics.averageSubscriptionValue)}</p>
                            </div>
                        </div>

                        <div className="admin-analytics-card">
                            <div className="admin-analytics-card__icon">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="admin-analytics-card__content">
                                <h3>Общ приход</h3>
                                <p className="admin-analytics-card__number">{formatCurrency(analytics.totalRevenue)}</p>
                            </div>
                        </div>

                        <div className="admin-analytics-card">
                            <div className="admin-analytics-card__icon">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="admin-analytics-card__content">
                                <h3>Общо плащания</h3>
                                <p className="admin-analytics-card__number">{analytics.totalPayments}</p>
                            </div>
                        </div>

                        <div className="admin-analytics-card">
                            <div className="admin-analytics-card__icon">
                                <TrendingUp className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div className="admin-analytics-card__content">
                                <h3>Средно плащане</h3>
                                <p className="admin-analytics-card__number">{formatCurrency(analytics.averagePaymentAmount)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Plan Distribution */}
                    <div className="subscription-management__plan-distribution">
                        <h3>Разпределение по планове</h3>
                        <div className="admin-plan-distribution">
                            {analytics.planDistribution.map((plan) => (
                                <div key={plan.planName} className="admin-plan-item">
                                    <span className="admin-plan-item__name">{plan.planName}</span>
                                    <span className="admin-plan-item__count">{plan.count} ({plan.percentage.toFixed(1)}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Paying Users */}
                    <div className="subscription-management__top-users">
                        <h3>Топ плащащи потребители</h3>
                        <div className="admin-top-users">
                            {analytics.topPayingUsers.map((user, index) => (
                                <div key={user.userId} className="admin-top-user-item">
                                    <div className="admin-top-user-item__rank">
                                        #{index + 1}
                                    </div>
                                    <div className="admin-top-user-item__info">
                                        <div className="admin-top-user-item__name">
                                            {user.userName || "Без име"}
                                        </div>
                                        <div className="admin-top-user-item__email">
                                            {user.userEmail}
                                        </div>
                                    </div>
                                    <div className="admin-top-user-item__stats">
                                        <div className="admin-top-user-item__amount">
                                            {formatCurrency(user.totalPaid)}
                                        </div>
                                        <div className="admin-top-user-item__count">
                                            {user.paymentCount} плащания
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="subscription-management__filters">
                <form onSubmit={handleSearch} className="subscription-management__search">
                    <input
                        type="text"
                        placeholder="Търсене по име или email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-input"
                    />
                    <button type="submit" className="admin-btn admin-btn--primary">
                        Търси
                    </button>
                </form>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="admin-select"
                >
                    <option value="">Всички статуси</option>
                    <option value="active">Активни</option>
                    <option value="cancelled">Отменени</option>
                    <option value="expired">Изтекли</option>
                    <option value="past_due">Просрочени</option>
                </select>
            </div>

            {error && (
                <div className="subscription-management__error">
                    <p>{error}</p>
                    <button
                        onClick={() => fetchSubscriptions(currentPage, searchTerm, statusFilter, planFilter)}
                        className="admin-btn admin-btn--secondary"
                    >
                        Опитай отново
                    </button>
                </div>
            )}

            {/* Subscriptions List */}
            <div className="subscription-management__list">
                {subscriptions.map((subscription) => {
                    const isExpanded = expandedSubscriptions.has(subscription.id);
                    const isActionLoading = actionLoading === subscription.id;

                    return (
                        <div key={subscription.id} className="admin-subscription-card">
                            <div className="admin-subscription-card__header">
                                <div className="admin-subscription-card__info">
                                    <div className="admin-subscription-card__user">
                                        <h3>{subscription.artist.user.name || "Без име"}</h3>
                                        <p>{subscription.artist.user.email}</p>
                                    </div>
                                    <div className="admin-subscription-card__plan">
                                        <span className="admin-plan-badge">{subscription.plan.displayName}</span>
                                        <span className="admin-billing-cycle">
                                            {subscription.billingCycle === "monthly" ? "Месечно" : "Годишно"}
                                        </span>
                                    </div>
                                </div>

                                <div className="admin-subscription-card__status">
                                    <div className="admin-subscription-card__status-info">
                                        {getStatusIcon(subscription.status)}
                                        <span className={`admin-status-badge ${getStatusColor(subscription.status)}`}>
                                            {subscription.status}
                                        </span>
                                    </div>
                                    <div className="admin-subscription-card__price">
                                        {formatCurrency(
                                            subscription.billingCycle === "monthly"
                                                ? subscription.plan.monthlyPrice
                                                : subscription.plan.yearlyPrice
                                        )}
                                    </div>
                                </div>

                                <div className="admin-subscription-card__actions">
                                    <button
                                        onClick={() => toggleExpanded(subscription.id)}
                                        className="admin-btn admin-btn--small admin-btn--secondary"
                                    >
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        {isExpanded ? "Скрий" : "Покажи повече"}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="admin-subscription-card__details">
                                    <div className="admin-subscription-card__details-grid">
                                        <div className="admin-subscription-card__detail">
                                            <label>Създаден:</label>
                                            <span>{formatDate(subscription.createdAt)}</span>
                                        </div>
                                        <div className="admin-subscription-card__detail">
                                            <label>Период от:</label>
                                            <span>{formatDate(subscription.currentPeriodStart)}</span>
                                        </div>
                                        <div className="admin-subscription-card__detail">
                                            <label>Период до:</label>
                                            <span>{formatDate(subscription.currentPeriodEnd)}</span>
                                        </div>
                                        <div className="admin-subscription-card__detail">
                                            <label>Макс. картини:</label>
                                            <span>{subscription.plan.maxActivePaintings}</span>
                                        </div>
                                        <div className="admin-subscription-card__detail">
                                            <label>Комисионна:</label>
                                            <span>{(subscription.plan.commissionRate * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="admin-subscription-card__detail">
                                            <label>Отмяна в края:</label>
                                            <span>{subscription.cancelAtPeriodEnd ? "Да" : "Не"}</span>
                                        </div>
                                    </div>

                                    {subscription.cancelledAt && (
                                        <div className="admin-subscription-card__detail">
                                            <label>Отменен на:</label>
                                            <span>{formatDate(subscription.cancelledAt)}</span>
                                        </div>
                                    )}

                                    <div className="admin-subscription-card__actions-detail">
                                        {subscription.status === "active" && (
                                            <>
                                                <button
                                                    onClick={() => openActionModal(subscription, "cancel")}
                                                    disabled={isActionLoading}
                                                    className="admin-btn admin-btn--small admin-btn--danger"
                                                >
                                                    Отмени
                                                </button>
                                                <button
                                                    onClick={() => openActionModal(subscription, "expire")}
                                                    disabled={isActionLoading}
                                                    className="admin-btn admin-btn--small admin-btn--warning"
                                                >
                                                    Изтегли
                                                </button>
                                            </>
                                        )}

                                        {subscription.status === "cancelled" && (
                                            <button
                                                onClick={() => openActionModal(subscription, "reactivate")}
                                                disabled={isActionLoading}
                                                className="admin-btn admin-btn--small admin-btn--primary"
                                            >
                                                Възстанови
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="subscription-management__pagination">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="admin-btn admin-btn--secondary"
                    >
                        Предишна
                    </button>

                    <span className="admin-pagination-info">
                        Страница {currentPage} от {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="admin-btn admin-btn--secondary"
                    >
                        Следваща
                    </button>
                </div>
            )}

            {/* Action Modal */}
            {showActionModal && selectedSubscription && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal__header">
                            <h2>
                                {actionType === "cancel" && "Отмяна на абонамент"}
                                {actionType === "reactivate" && "Възстановяване на абонамент"}
                                {actionType === "expire" && "Изтегляне на абонамент"}
                            </h2>
                            <button
                                onClick={() => setShowActionModal(false)}
                                className="admin-modal__close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="admin-modal__content">
                            <div className="admin-modal__subscription-info">
                                <h3>{selectedSubscription.artist.user.name || "Без име"}</h3>
                                <p>{selectedSubscription.artist.user.email}</p>
                                <p>План: <span className="admin-plan-badge">{selectedSubscription.plan.displayName}</span></p>
                                <p>Статус: <span className={`admin-status-badge ${getStatusColor(selectedSubscription.status)}`}>
                                    {selectedSubscription.status}
                                </span></p>
                            </div>

                            <div className="admin-modal__form">
                                <label className="admin-label">
                                    Причина за действието:
                                    <textarea
                                        value={actionReason}
                                        onChange={(e) => setActionReason(e.target.value)}
                                        placeholder="Опишете причината за това действие..."
                                        className="admin-textarea"
                                        rows={4}
                                        required
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="admin-modal__footer">
                            <button
                                onClick={() => setShowActionModal(false)}
                                className="admin-btn admin-btn--secondary"
                            >
                                Отказ
                            </button>
                            <button
                                onClick={handleSubscriptionAction}
                                disabled={!actionReason.trim() || actionLoading === selectedSubscription.id}
                                className={`admin-btn admin-btn--primary ${actionType === "cancel" ? "admin-btn--danger" :
                                    actionType === "expire" ? "admin-btn--warning" : ""
                                    }`}
                            >
                                {actionLoading === selectedSubscription.id ? "Изпълнява..." : "Потвърди"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagement;
