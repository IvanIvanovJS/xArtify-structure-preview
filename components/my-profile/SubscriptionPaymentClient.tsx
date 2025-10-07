"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArtistSubscription, SubscriptionPlan } from "@prisma/client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "../becomeAnArtist/styles/payment-page.css";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

interface SubscriptionPaymentClientProps {
    plan: SubscriptionPlan;
    currentSubscription: ArtistSubscription & { plan: SubscriptionPlan };
    paymentIntentId: string;
    userId: string;
}

const CheckoutForm = ({
    planId,
    billingCycle,
    userId,
    currentSubscriptionId
}: {
    planId: string;
    billingCycle: 'monthly' | 'yearly';
    userId: string;
    currentSubscriptionId: string;
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        if (!agreeToTerms) {
            setMessage("Моля, съгласете се с правилата на сайта за да продължите.");
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message || "Възникна грешка при плащането.");
            setIsLoading(false);
            return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
            try {
                const response = await fetch("/api/subscription/process-upgrade", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        planId,
                        billingCycle,
                        paymentIntentId: paymentIntent.id,
                        currentSubscriptionId
                    }),
                });

                if (response.ok) {
                    alert("Планът беше успешно надграден!");
                    router.push('/my-profile/subscription');
                } else {
                    const errorData = await response.json();
                    setMessage(`Грешка при надграждане на плана: ${errorData.message}`);
                }
            } catch (error) {
                console.error(error);
                setMessage("Възникна грешка при свързване със сървъра.");
            }
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <div className="payment-section">
                <h3 className="payment-section-title">Информация за плащането</h3>
                <PaymentElement />
            </div>

            <div className="terms-agreement">
                <label className="custom-checkbox-container">
                    <input
                        type="checkbox"
                        className="custom-checkbox-input"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                    />
                    <div className="custom-checkbox">
                        <svg className="custom-checkbox-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.29417 12.9577L10.5048 16.1681L17.6729 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                    </div>
                    <span className="form-checkbox-label">
                        Съгласявам се с <a href="/terms" target="_blank" className="terms-link">правилата на сайта</a> и <a href="/privacy" target="_blank" className="terms-link">политиката за поверителност</a> за промяна на абонамента
                    </span>
                </label>
            </div>

            <div className="payment-actions">
                <button
                    type="submit"
                    disabled={!stripe || !elements || isLoading || !agreeToTerms}
                    className="payment-button"
                >
                    {isLoading ? "Плащане..." : "Плати и надгради плана"}
                </button>
            </div>

            {message && (
                <div className="payment-error">
                    {message}
                </div>
            )}
        </form>
    );
};

export default function SubscriptionPaymentClient({
    plan,
    currentSubscription,
    paymentIntentId,
    userId
}: SubscriptionPaymentClientProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [clientSecret, setClientSecret] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const formatPrice = (cycle: 'monthly' | 'yearly') => {
        const price = cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
        return price.toFixed(0);
    };

    const getDiscountText = () => {
        if (billingCycle === 'yearly') {
            const savings = (plan.monthlyPrice * 12) - plan.yearlyPrice;
            return `Спестете ${savings.toFixed(0)}€ годишно`;
        }
        return null;
    };

    const handleStartPayment = async () => {
        setIsLoading(true);

        try {
            const response = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId: plan.id,
                    billingCycle,
                    isArtist: true,
                    isUpgrade: true,
                    currentSubscriptionId: currentSubscription.id
                }),
            });

            const data = await response.json();
            setClientSecret(data.clientSecret);
        } catch (error) {
            console.error(error);
            alert("Възникна грешка при стартиране на плащането.");
        } finally {
            setIsLoading(false);
        }
    };

    if (clientSecret) {
        const options = {
            clientSecret,
            appearance: {
                theme: "stripe",
                variables: {
                    colorPrimary: '#06b6d4',
                    colorBackground: '#1e293b',
                    colorText: '#ffffff',
                    colorDanger: '#ef4444',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px',
                }
            } as const,
        };

        return (
            <div className="payment-container">
                <div className="payment-header">
                    <button
                        onClick={() => router.back()}
                        className="back-button"
                    >
                        ← Назад
                    </button>
                    <h1 className="payment-title">Надграждане на плана</h1>
                </div>

                <div className="payment-content">
                    <div className="payment-summary">
                        <div className="summary-header">
                            <h2 className="summary-title">Надграждане към {plan.displayName}</h2>
                            <div className="summary-price">
                                <span className="price-amount">{formatPrice(billingCycle)}€</span>
                                <span className="price-period">за {billingCycle === 'yearly' ? 'година' : 'месец'}</span>
                            </div>
                        </div>

                        <div className="summary-details">
                            <div className="summary-item">
                                <span className="summary-label">Текущ план:</span>
                                <span className="summary-value">{currentSubscription.plan.displayName}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Нов план:</span>
                                <span className="summary-value">{plan.displayName}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Биллинг:</span>
                                <span className="summary-value">
                                    {billingCycle === 'yearly' ? 'Годишно' : 'Месечно'}
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Сума:</span>
                                <span className="summary-value">{formatPrice(billingCycle)}€</span>
                            </div>
                        </div>

                        {getDiscountText() && (
                            <div className="discount-info">
                                <span className="discount-text">{getDiscountText()}</span>
                            </div>
                        )}

                        <div className="summary-total">
                            <span className="total-label">Обща дължима сума днес:</span>
                            <span className="total-amount">{formatPrice(billingCycle)}€</span>
                        </div>
                    </div>

                    <div className="payment-form-container">
                        <Elements stripe={stripePromise} options={options}>
                            <CheckoutForm
                                planId={plan.id}
                                billingCycle={billingCycle}
                                userId={userId}
                                currentSubscriptionId={currentSubscription.id}
                            />
                        </Elements>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-container">
            <div className="payment-header">
                <button
                    onClick={() => router.back()}
                    className="back-button"
                >
                    ← Назад
                </button>
                <h1 className="payment-title">Надграждане на плана</h1>
            </div>

            <div className="payment-content">
                <div className="payment-summary">
                    <div className="summary-header">
                        <h2 className="summary-title">Надграждане към {plan.displayName}</h2>
                        <div className="summary-price">
                            <span className="price-amount">{formatPrice(billingCycle)}€</span>
                            <span className="price-period">за {billingCycle === 'yearly' ? 'година' : 'месец'}</span>
                        </div>
                    </div>

                    <div className="summary-details">
                        <div className="summary-item">
                            <span className="summary-label">Текущ план:</span>
                            <span className="summary-value">{currentSubscription.plan.displayName}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Нов план:</span>
                            <span className="summary-value">{plan.displayName}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Биллинг:</span>
                            <span className="summary-value">
                                {billingCycle === 'yearly' ? 'Годишно' : 'Месечно'}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Сума:</span>
                            <span className="summary-value">{formatPrice(billingCycle)}€</span>
                        </div>
                    </div>

                    {getDiscountText() && (
                        <div className="discount-info">
                            <span className="discount-text">{getDiscountText()}</span>
                        </div>
                    )}

                    <div className="summary-total">
                        <span className="total-label">Обща дължима сума днес:</span>
                        <span className="total-amount">{formatPrice(billingCycle)}€</span>
                    </div>
                </div>

                <div className="billing-selection">
                    <h3 className="billing-title">Изберете биллинг цикъл</h3>
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

                <div className="payment-actions">
                    <button
                        onClick={handleStartPayment}
                        disabled={isLoading}
                        className="payment-button"
                    >
                        {isLoading ? "Изчакване..." : "Продължи към плащане"}
                    </button>
                </div>
            </div>
        </div>
    );
}
