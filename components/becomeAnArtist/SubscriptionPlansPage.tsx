"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionPlan } from "@prisma/client";
import "./styles/subscription-plans-page.css";

interface SubscriptionPlansPageProps {
    plans: SubscriptionPlan[];
    userId: string;
}

export default function SubscriptionPlansPage({ plans, userId }: SubscriptionPlansPageProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [openRequirement, setOpenRequirement] = useState<number | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const router = useRouter();


    const formatPrice = (plan: SubscriptionPlan, cycle: 'monthly' | 'yearly') => {
        if (plan.name === 'Free') return '0';
        const price = cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
        return price.toFixed(0);
    };

    const getDiscountText = (plan: SubscriptionPlan) => {
        if (plan.name === 'Free' || billingCycle === 'monthly') return null;
        const savings = (plan.monthlyPrice * 12) - plan.yearlyPrice;
        return `Спестете ${savings.toFixed(0)}€ годишно`;
    };

    const handleSelectPlan = (planId: string) => {
        router.push(`/become-an-artist/form?planId=${planId}`);
    };

    const requirements = [
        {
            title: "Управление на профила",
            description: "Артистът управлява сам своя профил, качване на картини и съдържание съгласно правилата на платформата."
        },
        {
            title: "Опаковане и изпращане",
            description: "Лично опаковане и изпращане на картините към клиентите."
        },
        {
            title: "Сертификат за достоверност",
            description: "Издаване на сертификат за достоверност за всяка продадена картина."
        },
        {
            title: "Застраховка",
            description: "Застраховка на картините с обявена стойност при нередност."
        },
        {
            title: "Спазване на правилата",
            description: "Сайтът запазва правото си да деактивира абонамента и профила при нарушаване на правилата."
        }
    ];

    const faqItems = [
        {
            question: "Мога ли да сменя плана по-късно?",
            answer: "Да, можете да надградите или понижите плана си по всяко време. Промените влизат в сила веднага."
        },
        {
            question: "Какво се случва с картините ми при отмяна?",
            answer: "При отмяна на абонамента, картините ви остават активни до края на текущия билинг период. След това се деактивират автоматично."
        },
        {
            question: "Има ли скрити такси?",
            answer: "Не, всички цени са прозрачни и включват всички такси. Единствената допълнителна такса е комисионната от продажбите."
        }
    ];

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
        <div className="subscription-plans-page">
            <div className="plans-header">
                <h1 className="plans-title">
                    Започнете безплатно
                </h1>
                <p className="plans-subtitle">
                    Надградете според нуждите си
                </p>
            </div>

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

            {/* Pricing Cards */}
            <div className="pricing-cards">
                {plans.map((plan, index) => {
                    const isPopular = plan.name === 'Medium';
                    const discountText = getDiscountText(plan);
                    const features = getPlanFeatures(plan);

                    return (
                        <div
                            key={plan.id}
                            className={`pricing-card ${isPopular ? 'popular' : ''}`}
                        >
                            {isPopular && (
                                <div className="popular-badge">
                                    Най-използван
                                </div>
                            )}

                            {discountText && (
                                <div className="discount-badge">
                                    -20%
                                </div>
                            )}

                            <div className="card-header">
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
                                {features.map((feature, featureIndex) => (
                                    <div key={featureIndex} className="feature-item">
                                        <svg className="feature-check" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.29417 12.9577L10.5048 16.1681L17.6729 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                        </svg>
                                        <span className="feature-text">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleSelectPlan(plan.id)}
                                className={`plan-button ${isPopular ? 'primary' : 'secondary'}`}
                            >
                                {plan.name === 'Free' ? 'Започнете безплатно' : 'Изберете план'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Feature Comparison Table */}
            <div className="comparison-table">
                <h2 className="comparison-title">Сравнение на функциите</h2>

                <div className="table-container">
                    <table className="features-table">
                        <thead>
                            <tr>
                                <th className="feature-column">Функции</th>
                                <th className="plan-column">Безплатен</th>
                                <th className="plan-column">Среден</th>
                                <th className="plan-column">Висок</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="feature-name">Активни картини</td>
                                <td className="plan-value">5</td>
                                <td className="plan-value">30</td>
                                <td className="plan-value">Неограничено</td>
                            </tr>
                            <tr>
                                <td className="feature-name">Комисионна от продажба</td>
                                <td className="plan-value">30%</td>
                                <td className="plan-value">20%</td>
                                <td className="plan-value">3%</td>
                            </tr>
                            <tr>
                                <td className="feature-name">Аналитични данни</td>
                                <td className="plan-value">Минимален достъп</td>
                                <td className="plan-value">Голям достъп</td>
                                <td className="plan-value">Пълна аналитика</td>
                            </tr>
                            <tr>
                                <td className="feature-name">Приоритет на реклами</td>
                                <td className="plan-value">Нисък</td>
                                <td className="plan-value">Висок</td>
                                <td className="plan-value">Много висок</td>
                            </tr>
                            <tr>
                                <td className="feature-name">Директна комуникация с клиенти</td>
                                <td className="plan-check">—</td>
                                <td className="plan-check">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="table-check">
                                        <path d="M7.29417 12.9577L10.5048 16.1681L17.6729 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                    </svg>
                                </td>
                                <td className="plan-check">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="table-check">
                                        <path d="M7.29417 12.9577L10.5048 16.1681L17.6729 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                    </svg>
                                </td>
                            </tr>
                            <tr>
                                <td className="feature-name">Имейл промоции</td>
                                <td className="plan-check">—</td>
                                <td className="plan-check">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="table-check">
                                        <path d="M7.29417 12.9577L10.5048 16.1681L17.6729 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                    </svg>
                                </td>
                                <td className="plan-check">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="table-check">
                                        <path d="M7.29417 12.9577L10.5048 16.1681L17.6729 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                    </svg>
                                </td>
                            </tr>
                            <tr>
                                <td className="feature-name">Нотификации за нови картини</td>
                                <td className="plan-check">—</td>
                                <td className="plan-check">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="table-check">
                                        <path d="M7.29417 12.9577L10.5048 16.1681L17.6729 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                    </svg>
                                </td>
                                <td className="plan-check">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="table-check">
                                        <path d="M7.29417 12.9577L10.5048 16.1681L17.6729 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                    </svg>
                                </td>
                            </tr>
                            <tr>
                                <td className="feature-name">Сертификат за достоверност</td>
                                <td className="plan-check">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="table-check">
                                        <path d="M7.29417 12.9577L10.5048 16.1681L17.6729 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                    </svg>
                                </td>
                                <td className="plan-check">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="table-check">
                                        <path d="M7.29417 12.9577L10.5048 16.1681L17.6729 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                    </svg>
                                </td>
                                <td className="plan-check">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="table-check">
                                        <path d="M7.29417 12.9577L10.5048 16.1681L17.6729 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                    </svg>
                                </td>
                            </tr>
                            <tr>
                                <td className="feature-name">Застраховка на картините</td>
                                <td className="plan-check">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="table-check">
                                        <path d="M7.29417 12.9577L10.5048 16.1681L17.6729 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                    </svg>
                                </td>
                                <td className="plan-check">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="table-check">
                                        <path d="M7.29417 12.9577L10.5048 16.1681L17.6729 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                    </svg>
                                </td>
                                <td className="plan-check">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="table-check">
                                        <path d="M7.29417 12.9577L10.5048 16.1681L17.6729 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                    </svg>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 2: Artist Requirements */}
            <div className="comparison-table">
                <h2 className="comparison-title">Изисквания към артиста</h2>
                <div className="requirements-content">
                    {requirements.map((requirement, index) => (
                        <div
                            key={index}
                            className={`requirement-item ${openRequirement === index ? 'requirement-open' : ''}`}
                            onClick={() => setOpenRequirement(openRequirement === index ? null : index)}
                        >
                            <div className="requirement-question">
                                <span className="requirement-number">{index + 1}</span>
                                <span className="requirement-title">{requirement.title}</span>
                                <div className="requirement-chevron">
                                    <svg
                                        className={`requirement-chevron-icon ${openRequirement === index ? 'requirement-chevron-rotated' : ''}`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            {openRequirement === index && (
                                <div className="requirement-answer">
                                    <p className="requirement-text">{requirement.description}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Section 3: FAQ Section */}
            <div className="faq-section">
                <h2 className="faq-title">Често задавани въпроси</h2>

                <div className="faq-items">
                    {faqItems.map((faq, index) => (
                        <div
                            key={index}
                            className={`faq-item ${openFaq === index ? 'faq-open' : ''}`}
                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        >
                            <div className="faq-question">
                                <span className="faq-question-number">{index + 1}</span>
                                <span className="faq-question-text">{faq.question}</span>
                                <div className="faq-chevron">
                                    <svg
                                        className={`faq-chevron-icon ${openFaq === index ? 'faq-chevron-rotated' : ''}`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            {openFaq === index && (
                                <div className="faq-answer">
                                    <p className="faq-answer-text">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
