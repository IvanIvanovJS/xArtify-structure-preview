"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArtistSubscription, SubscriptionPlan } from "@prisma/client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "../becomeAnArtist/styles/payment-page.css";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

interface SubscriptionPaymentClientProps {
    plan: SubscriptionPlan;
    currentSubscription: ArtistSubscription & { plan: SubscriptionPlan };
    subscriptionId: string;
    userId: string;
    isDowngrade?: boolean;
}

const CheckoutForm = ({
    planId,
    billingCycle,
    subscriptionId
}: {
    planId: string;
    billingCycle: 'monthly' | 'yearly';
    subscriptionId: string;
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
                const response = await fetch("/api/subscription/confirm-subscription", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        subscriptionId,
                        planId,
                        billingCycle,
                        paymentIntentId: paymentIntent.id
                    }),
                });

                if (response.ok) {
                    alert("Абонаментът беше създаден успешно!");
                    router.push('/my-profile/subscription');
                } else {
                    const errorData = await response.json();
                    setMessage(`Грешка: ${errorData.message}`);
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
                        <svg className="custom-checkbox-icon" viewBox="0 0 24 24" fill="none">
                            <path d="M7.29417 12.9577L10.5048 16.1681L17.6729 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                    </div>
                    <span className="form-checkbox-label">
                        Съгласявам се с <a href="/terms" target="_blank" className="terms-link">правилата на сайта</a> и <a href="/privacy" target="_blank" className="terms-link">политиката за поверителност</a>
                    </span>
                </label>
            </div>

            <button
                type="submit"
                disabled={!stripe || !elements || isLoading || !agreeToTerms}
                className="payment-button"
            >
                {isLoading ? "Обработка..." : "Плати и надгради плана"}
            </button>

            {message && <div className="payment-error">{message}</div>}
        </form>
    );
};

export default function SubscriptionPaymentClient({
    plan,
    currentSubscription,
    subscriptionId,
    userId,
    isDowngrade = false
}: SubscriptionPaymentClientProps) {
    const [billingCycle] = useState<'monthly' | 'yearly'>(currentSubscription.billingCycle as 'monthly' | 'yearly');
    const [clientSecret, setClientSecret] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchClientSecret = async () => {
            setIsLoading(true);
            setError("");

            const storedClientSecret = sessionStorage.getItem('payment_client_secret');
            const storedSubscriptionId = sessionStorage.getItem('payment_subscription_id');

            console.log('SessionStorage check:', {
                hasStoredSecret: !!storedClientSecret,
                storedSubscriptionId,
                currentSubscriptionId: subscriptionId,
                match: storedSubscriptionId === subscriptionId
            });

            if (storedClientSecret && storedSubscriptionId === subscriptionId) {
                console.log('Using stored client secret');
                setClientSecret(storedClientSecret);
                sessionStorage.removeItem('payment_client_secret');
                sessionStorage.removeItem('payment_subscription_id');
                setIsLoading(false);
                return;
            }

            // If not in sessionStorage, try to get it from the API as fallback
            console.log('Fetching client secret from API for subscription:', subscriptionId);
            try {
                const response = await fetch(`/api/subscription/get-client-secret?subscriptionId=${subscriptionId}`);
                const data = await response.json();

                console.log('API response:', { ok: response.ok, status: response.status, data });

                if (response.ok && data.clientSecret) {
                    console.log('Got client secret from API');
                    setClientSecret(data.clientSecret);
                } else {
                    console.error('No client secret from API:', data);
                    setError('Не е намерен client secret за това плащане');
                }
            } catch (err) {
                console.error('Failed to get client secret:', err);
                setError('Грешка при зареждане на плащането');
            } finally {
                setIsLoading(false);
            }
        };

        if (subscriptionId && !isDowngrade) {
            fetchClientSecret();
        }
    }, [subscriptionId, isDowngrade]);

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

    if (isLoading) {
        return (
            <div className="payment-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Зареждане на плащането...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-container">
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={() => router.back()} className="back-button">
                        Назад
                    </button>
                </div>
            </div>
        );
    }

    if (!clientSecret) {
        return (
            <div className="payment-container">
                <p>Моля, изчакайте...</p>
            </div>
        );
    }

    const options = {
        clientSecret,
        appearance: {
            theme: "stripe" as const,
            variables: {
                colorPrimary: '#06b6d4',
                colorBackground: '#1e293b',
                colorText: '#ffffff',
                colorDanger: '#ef4444',
                fontFamily: 'Inter, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
            }
        },
    };

    return (
        <div className="payment-container">
            <div className="payment-header">
                <button onClick={() => router.back()} className="back-button">
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
                            subscriptionId={subscriptionId}
                        />
                    </Elements>
                </div>
            </div>
        </div>
    );
}
