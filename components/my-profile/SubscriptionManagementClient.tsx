"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArtistSubscription, SubscriptionPlan } from "@prisma/client";
import { getSubscriptionStatusMessage, isSubscriptionActive, getDaysUntilExpiration } from "@/lib/subscription-utils";
import "./styles/subscription-management.css";
import "./styles/subscription-status.css";
import "./styles/confirmation-modal.css";

interface SubscriptionManagementClientProps {
    currentSubscription: (ArtistSubscription & { plan: SubscriptionPlan }) | null;
    availablePlans: SubscriptionPlan[];
    userId: string;
}

export default function SubscriptionManagementClient({
    currentSubscription,
    availablePlans,
    userId
}: SubscriptionManagementClientProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const router = useRouter();

    const formatPrice = (plan: SubscriptionPlan, cycle: 'monthly' | 'yearly') => {
        if (plan.name === 'Hobby') return '0';
        const price = cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
        return price.toFixed(0);
    };

    const getDiscountText = (plan: SubscriptionPlan) => {
        if (plan.name === 'Hobby' || billingCycle === 'monthly') return null;
        const savings = (plan.monthlyPrice * 12) - plan.yearlyPrice;
        return `Спестете ${savings.toFixed(0)}€ годишно`;
    };

    const handlePlanChange = async (planId: string) => {
        const plan = availablePlans.find(p => p.id === planId);
        if (!plan) return;

        // If it's the same plan, do nothing
        if (currentSubscription?.planId === planId) {
            return;
        }

        const isDowngrade = currentSubscription && plan.monthlyPrice < currentSubscription.plan.monthlyPrice;

        // For downgrades, redirect to payment page with downgrade flag
        if (isDowngrade) {
            router.push(`/my-profile/subscription/payment?planId=${planId}&isDowngrade=true`);
            return;
        }

        // For upgrades, redirect to payment
        setSelectedPlan(planId);
        setIsLoading(true);

        try {
            const response = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId,
                    billingCycle,
                    isArtist: true,
                    isUpgrade: true,
                    currentSubscriptionId: currentSubscription?.id
                }),
            });

            const data = await response.json();
            if (data.clientSecret) {
                router.push(`/my-profile/subscription/payment?planId=${planId}&paymentIntentId=${data.paymentIntentId}`);
            }
        } catch (error) {
            console.error(error);
            alert("Възникна грешка при стартиране на плащането.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDowngrade = async (planId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/subscription/change-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId,
                    billingCycle: 'monthly',
                    isDowngrade: true
                }),
            });

            if (response.ok) {
                alert("Планът беше успешно променен!");
                // router.refresh(); // Removed to prevent navigation conflicts
            } else {
                const errorData = await response.json();
                alert(`Грешка при промяна на плана: ${errorData.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("Възникна грешка при свързване със сървъра.");
        } finally {
            setIsLoading(false);
        }
    };

    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

    const handleCancelSubscription = async () => {
        if (!currentSubscription) return;
        setShowCancelConfirmation(true);
    };

    const handleConfirmCancel = async () => {
        if (!currentSubscription) return;

        setIsLoading(true);
        try {
            const response = await fetch("/api/subscription/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subscriptionId: currentSubscription.id,
                    cancelAtPeriodEnd: true
                }),
            });

            if (response.ok) {
                alert("Абонаментът ще бъде спрян в края на текущия период.");
                // router.refresh(); // Removed to prevent navigation conflicts
            } else {
                const errorData = await response.json();
                alert(`Грешка при спиране на абонамента: ${errorData.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("Възникна грешка при свързване със сървъра.");
        } finally {
            setIsLoading(false);
            setShowCancelConfirmation(false);
        }
    };

    const handleReactivateSubscription = async () => {
        if (!currentSubscription) return;

        setIsLoading(true);
        try {
            const response = await fetch("/api/subscription/reactivate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subscriptionId: currentSubscription.id
                }),
            });

            if (response.ok) {
                alert("Абонаментът беше реактивиран успешно!");
                // router.refresh(); // Removed to prevent navigation conflicts
            } else {
                const errorData = await response.json();
                alert(`Грешка при реактивиране на абонамента: ${errorData.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("Възникна грешка при свързване със сървъра.");
        } finally {
            setIsLoading(false);
        }
    };

    const getPlanFeatures = (plan: SubscriptionPlan) => {
        const features = [];

        if (plan.maxActivePaintings === -1) {
            features.push("Неограничени картини");
        } else {
            features.push(`${plan.maxActivePaintings} активни картини`);
        }

        features.push(`${(plan.commissionRate * 100).toFixed(0)}% комисионна`);

        if (plan.analyticsAccess === 'minimal') {
            features.push("Минимален достъп до аналитика");
        } else if (plan.analyticsAccess === 'extended') {
            features.push("Голям достъп до аналитика");
        } else {
            features.push("Пълна аналитика");
        }

        if (plan.advertisingPriority === 'low') {
            features.push("Нисък приоритет на реклами");
        } else if (plan.advertisingPriority === 'high') {
            features.push("Висок приоритет на реклами");
        } else {
            features.push("Много висок приоритет на реклами");
        }

        if (plan.directCommunication) {
            features.push("Директна комуникация с клиенти");
        }

        if (plan.emailPromotions) {
            features.push("Имейл промоции");
        }

        if (plan.notifications) {
            features.push("Нотификации за нови картини");
        }

        features.push("Сертификат за достоверност");
        features.push("Застраховка на картините");

        return features;
    };

    return (
        <div className="subscription-management">
            <div className="subscription-header">
                <h1 className="subscription-title">Управление на абонамента</h1>
                <p className="subscription-subtitle">
                    Променете плана си според нуждите си
                </p>
            </div>

            {/* Current Subscription */}
            {currentSubscription && (
                <div className="current-subscription">
                    <h2 className="current-subscription-title">Текущ план</h2>
                    <div className="current-subscription-card">
                        <div className="current-plan-info">
                            <h3 className="current-plan-name">{currentSubscription.plan.displayName}</h3>
                            <p className="current-plan-description">{currentSubscription.plan.description}</p>
                            <div className="current-plan-price">
                                <span className="current-price-amount">
                                    {formatPrice(currentSubscription.plan, currentSubscription.billingCycle as 'monthly' | 'yearly')}€
                                </span>
                                <span className="current-price-period">
                                    /{currentSubscription.billingCycle === 'yearly' ? 'година' : 'месец'}
                                </span>
                            </div>
                        </div>
                        {/* Subscription Status Message */}


                        {/* Subscription Actions */}
                        <div className="subscription-actions-wrapper">
                            <div className="subscription-status-info">
                                <p className="status-message">{getSubscriptionStatusMessage(currentSubscription)}</p>
                                {currentSubscription.currentPeriodEnd && (
                                    <p className="period-info">
                                        {currentSubscription.cancelAtPeriodEnd ? 'Спиране на: ' : 'Следващо плащане: '}
                                        {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('bg-BG')}
                                    </p>
                                )}
                            </div>
                            <div className="subscription-actions">
                                {currentSubscription.cancelAtPeriodEnd ? (
                                    <button
                                        onClick={handleReactivateSubscription}
                                        disabled={isLoading}
                                        className="reactivate-button"
                                    >
                                        Реактивирай абонамента
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleCancelSubscription}
                                        disabled={isLoading}
                                        className="subscription-cancel-button"
                                    >
                                        Спри абонамента
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Billing Toggle */}
            <div className="billing-toggle-container">
                <div className="billing-toggle">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`billing-option ${billingCycle === 'monthly' ? 'active' : ''}`}
                    >
                        Месечно
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`billing-option ${billingCycle === 'yearly' ? 'active' : ''}`}
                    >
                        Годишно (-20%)
                    </button>
                </div>
            </div>

            {/* Available Plans */}
            <div className="available-plans">
                <h2 className="available-plans-title">Достъпни планове</h2>
                <div className="plans-grid">
                    {availablePlans.map((plan) => {
                        const isCurrentPlan = currentSubscription?.planId === plan.id;
                        const isUpgrade = currentSubscription && plan.monthlyPrice > currentSubscription.plan.monthlyPrice;
                        const isDowngrade = currentSubscription && plan.monthlyPrice < currentSubscription.plan.monthlyPrice;
                        const discountText = getDiscountText(plan);
                        const features = getPlanFeatures(plan);

                        return (
                            <div
                                key={plan.id}
                                className={`plan-card ${isCurrentPlan ? 'current' : ''} ${isUpgrade ? 'upgrade' : ''} ${isDowngrade ? 'downgrade' : ''}`}
                            >
                                {isCurrentPlan && (
                                    <div className="current-plan-badge">
                                        Текущ план
                                    </div>
                                )}

                                {discountText && (
                                    <div className="discount-badge">
                                        -20%
                                    </div>
                                )}

                                <div className="plan-header">
                                    <h3 className="plan-name">{plan.displayName}</h3>
                                    <p className="plan-description">{plan.description}</p>

                                    <div className="plan-price">
                                        <span className="price-amount">{formatPrice(plan, billingCycle)}€</span>
                                        <span className="price-period">/{billingCycle === 'yearly' ? 'година' : 'месец'}</span>
                                    </div>

                                    {discountText && (
                                        <p className="discount-text">{discountText}</p>
                                    )}
                                </div>

                                <div className="plan-features">
                                    {features.map((feature, index) => (
                                        <div key={index} className="feature-item">
                                            <svg className="feature-check" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M7.29417 12.9577L10.5048 16.1681L17.6729 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                            </svg>
                                            <span className="feature-text">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handlePlanChange(plan.id)}
                                    disabled={isCurrentPlan || isLoading}
                                    className={`plan-button ${isCurrentPlan ? 'current' : isUpgrade ? 'upgrade' : isDowngrade ? 'downgrade' : 'secondary'}`}
                                >
                                    {isCurrentPlan ? 'Текущ план' :
                                        isUpgrade ? 'Надгради' :
                                            isDowngrade ? 'Понижи' :
                                                'Избери план'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelConfirmation && (
                <div className="confirmation-modal">
                    <div className="confirmation-content">
                        <h3>Потвърждение за спиране</h3>
                        <p>
                            Сигурни ли сте, че искате да спрете абонамента? Ще загубите достъпа до премиум функциите в края на текущия период.
                        </p>
                        <p>
                            Абонаментът ще остане активен до {currentSubscription?.currentPeriodEnd ? new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('bg-BG') : 'края на периода'}.
                        </p>
                        <div className="confirmation-actions">
                            <button
                                onClick={() => setShowCancelConfirmation(false)}
                                className="cancel-button"
                                disabled={isLoading}
                            >
                                Отказ
                            </button>
                            <button
                                onClick={handleConfirmCancel}
                                className="subscription-cancel-button"
                                disabled={isLoading}
                            >
                                {isLoading ? "Обработка..." : "Да, спри абонамента"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
