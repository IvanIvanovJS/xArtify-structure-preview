"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionPlan } from "@prisma/client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "./styles/subscription-plans.css";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

interface SubscriptionPlansClientProps {
    plans: SubscriptionPlan[];
    userId: string;
}

interface PlanFeature {
    name: string;
    free: string | boolean;
    medium: string | boolean;
    high: string | boolean;
}

const planFeatures: PlanFeature[] = [
    {
        name: "Активни картини",
        free: "5",
        medium: "30",
        high: "Неограничено"
    },
    {
        name: "Комисионна от продажба",
        free: "30%",
        medium: "20%",
        high: "3%"
    },
    {
        name: "Аналитични данни",
        free: "Минимален достъп",
        medium: "Голям достъп",
        high: "Пълна аналитика"
    },
    {
        name: "Приоритет на реклами",
        free: "Нисък",
        medium: "Висок",
        high: "Много висок"
    },
    {
        name: "Директна комуникация с клиенти",
        free: false,
        medium: true,
        high: true
    },
    {
        name: "Имейл промоции",
        free: false,
        medium: true,
        high: true
    },
    {
        name: "Нотификации за нови картини",
        free: false,
        medium: true,
        high: true
    },
    {
        name: "Сертификат за достоверност",
        free: true,
        medium: true,
        high: true
    },
    {
        name: "Застраховка на картините",
        free: true,
        medium: true,
        high: true
    }
];

const CheckoutForm = ({
    planId,
    billingCycle,
    userId
}: {
    planId: string;
    billingCycle: 'monthly' | 'yearly';
    userId: string;
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

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
                const response = await fetch("/api/become-an-artist/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        planId,
                        billingCycle,
                        userId,
                        paymentIntentId: paymentIntent.id
                    }),
                });

                if (response.ok) {
                    const result = await response.json();
                    alert("Абонаментът беше успешно активиран!");
                    router.push(`/become-an-artist/form?planId=${planId}`);
                } else {
                    const errorData = await response.json();
                    setMessage(`Грешка при активиране на абонамента: ${errorData.message}`);
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
            <PaymentElement />
            <div className="flex justify-end mt-6">
                <button
                    type="submit"
                    disabled={!stripe || !elements || isLoading}
                    className="w-full py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {isLoading ? "Плащане..." : "Плати и продължи"}
                </button>
            </div>
            {message && (
                <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 rounded-md">
                    {message}
                </div>
            )}
        </form>
    );
};

export default function SubscriptionPlansClient({ plans, userId }: SubscriptionPlansClientProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectPlan = async (planId: string) => {
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        // If it's the free plan, redirect directly to form
        if (plan.name === 'Hobby') {
            window.location.href = `/become-an-artist/form?planId=${planId}`;
            return;
        }

        setSelectedPlan(planId);
        setIsLoading(true);

        try {
            const response = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId,
                    billingCycle,
                    isArtist: true
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

    const formatPrice = (plan: SubscriptionPlan, cycle: 'monthly' | 'yearly') => {
        if (plan.name === 'Hobby') return '0';

        const price = cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
        return price.toFixed(0);
    };

    const getDiscountText = (plan: SubscriptionPlan) => {
        if (plan.name === 'Hobby') return null;
        const savings = (plan.monthlyPrice * 12) - plan.yearlyPrice;
        return `Спестете ${savings.toFixed(0)}€ годишно`;
    };

    if (clientSecret && selectedPlan) {
        const options = {
            clientSecret,
            appearance: { theme: "stripe" } as const,
        };

        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-6">Завършете плащането</h2>
                    <Elements stripe={stripePromise} options={options}>
                        <CheckoutForm
                            planId={selectedPlan}
                            billingCycle={billingCycle}
                            userId={userId}
                        />
                    </Elements>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
                <div className="bg-white/10 backdrop-blur-lg rounded-full p-1 border border-white/20">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${billingCycle === 'monthly'
                            ? 'bg-white text-gray-900'
                            : 'text-white hover:text-gray-200'
                            }`}
                    >
                        Месечно
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${billingCycle === 'yearly'
                            ? 'bg-white text-gray-900'
                            : 'text-white hover:text-gray-200'
                            }`}
                    >
                        Годишно
                    </button>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                {plans.map((plan, index) => {
                    const isPopular = plan.name === 'Pro';
                    const discountText = getDiscountText(plan);

                    return (
                        <div
                            key={plan.id}
                            className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${isPopular
                                ? 'border-cyan-400 shadow-2xl shadow-cyan-500/25'
                                : 'border-white/20 hover:border-white/40'
                                }`}
                        >
                            {isPopular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                        Предпочитан
                                    </span>
                                </div>
                            )}

                            {billingCycle === 'yearly' && discountText && (
                                <div className="absolute -top-2 -right-2">
                                    <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                        -20%
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">{plan.displayName}</h3>
                                <p className="text-gray-300 text-sm mb-4">{plan.description}</p>

                                <div className="mb-4">
                                    <span className="text-5xl font-bold text-white">
                                        {formatPrice(plan, billingCycle)}€
                                    </span>
                                    <span className="text-gray-300 ml-2">
                                        /{billingCycle === 'yearly' ? 'година' : 'месец'}
                                    </span>
                                </div>

                                {discountText && billingCycle === 'yearly' && (
                                    <p className="text-cyan-400 text-sm font-medium">{discountText}</p>
                                )}
                            </div>

                            <button
                                onClick={() => handleSelectPlan(plan.id)}
                                disabled={isLoading}
                                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${isPopular
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white'
                                    : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isLoading ? "Изчакване..." : plan.name === 'Hobby' ? "Започнете безплатно" : "Изберете план"}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Feature Comparison Table */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-8 text-center">
                    Сравнение на функциите
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/20">
                                <th className="text-left py-4 px-4 text-white font-medium">Функции</th>
                                <th className="text-center py-4 px-4 text-white font-medium">Безплатен</th>
                                <th className="text-center py-4 px-4 text-white font-medium">Среден</th>
                                <th className="text-center py-4 px-4 text-white font-medium">Висок</th>
                            </tr>
                        </thead>
                        <tbody>
                            {planFeatures.map((feature, index) => (
                                <tr key={index} className="border-b border-white/10">
                                    <td className="py-4 px-4 text-white font-medium">
                                        {feature.name}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {typeof feature.free === 'boolean' ? (
                                            feature.free ? (
                                                <span className="text-green-400 text-xl">✓</span>
                                            ) : (
                                                <span className="text-gray-500">—</span>
                                            )
                                        ) : (
                                            <span className="text-white">{feature.free}</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {typeof feature.medium === 'boolean' ? (
                                            feature.medium ? (
                                                <span className="text-green-400 text-xl">✓</span>
                                            ) : (
                                                <span className="text-gray-500">—</span>
                                            )
                                        ) : (
                                            <span className="text-white">{feature.medium}</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {typeof feature.high === 'boolean' ? (
                                            feature.high ? (
                                                <span className="text-green-400 text-xl">✓</span>
                                            ) : (
                                                <span className="text-gray-500">—</span>
                                            )
                                        ) : (
                                            <span className="text-white">{feature.high}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-16 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-8 text-center">
                    Често задавани въпроси
                </h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Мога ли да сменя плана по-късно?
                        </h3>
                        <p className="text-gray-300">
                            Да, можете да надградите или понижите плана си по всяко време.
                            Промените влизат в сила веднага.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Какво се случва с картините ми при отмяна?
                        </h3>
                        <p className="text-gray-300">
                            При отмяна на абонамента, картините ви остават активни до края на
                            текущия билинг период. След това се деактивират автоматично.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Има ли скрити такси?
                        </h3>
                        <p className="text-gray-300">
                            Не, всички цени са прозрачни и включват всички такси.
                            Единствената допълнителна такса е комисионната от продажбите.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

