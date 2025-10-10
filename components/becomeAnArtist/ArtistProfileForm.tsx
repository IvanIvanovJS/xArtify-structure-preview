"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SubscriptionPlan, User, PaymentIntent } from "@prisma/client";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";
import { Tooltip } from "@/components/ui/Tooltip";
import "./styles/artist-profile-form.css";

interface ArtistProfileFormProps {
    userId: string;
    userData: Pick<User, 'name' | 'email' | 'image'> | null;
    selectedPlan: SubscriptionPlan | null;
    paymentInfo: PaymentIntent | null;
}

interface FAQItem {
    question: string;
    answer: string;
}

const sampleFAQs = [
    {
        question: "Какви техники използвате?",
        answer: "Работя основно с маслени бои и акрил върху платно."
    },
    {
        question: "Колко време отнема създаването на картина?",
        answer: "Обикновено отнема между 2-4 седмици в зависимост от сложността."
    },
    {
        question: "Правите ли поръчки по спецификация?",
        answer: "Да, приемам поръчки за картини по спецификация на клиентите."
    },
    {
        question: "Как се изпращат картините?",
        answer: "Всички картини се опаковат внимателно и се изпращат с куриерска служба."
    },
    {
        question: "Имате ли сертификат за достоверност?",
        answer: "Да, всяка картина идва с сертификат за достоверност."
    }
];

export default function ArtistProfileForm({ userId, userData, selectedPlan, paymentInfo }: ArtistProfileFormProps) {
    const router = useRouter();
    const { update } = useSession();

    // Form state
    const [formData, setFormData] = useState({
        name: userData?.name || "",
        email: userData?.email || "",
        bio: "",
        phoneNumber: "",
        birthDate: "",
        showBirthDate: false,
        country: "България",
        city: "",
        isTwoFactorEnabled: false,
        faqs: [] as FAQItem[]
    });

    const [isValidPhone, setIsValidPhone] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Validation
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Името е задължително";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Имейлът е задължително";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Невалиден имейл адрес";
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = "Телефонният номер е задължителен";
        } else if (!isValidPhoneNumber(formData.phoneNumber)) {
            newErrors.phoneNumber = "Невалиден телефонен номер";
        }

        if (formData.bio.length > 750) {
            newErrors.bio = "Биографията не може да бъде по-дълга от 750 символа";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/become-an-artist/create-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    userId,
                    planId: selectedPlan?.id,
                    paymentIntentId: paymentInfo?.id
                }),
            });

            if (response.ok) {
                const result = await response.json();
                await update({ ...userData, isArtist: true });

                // Redirect to artist profile after successful creation
                router.push(`/artists/${result.artistProfile.id}`);
            } else {
                const errorData = await response.json();
                alert(`Грешка при създаване на профил: ${errorData.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("Възникна грешка при свързване със сървъра.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const addFAQ = () => {
        setFormData(prev => ({
            ...prev,
            faqs: [...prev.faqs, { question: "", answer: "" }]
        }));
    };

    const removeFAQ = (index: number) => {
        setFormData(prev => ({
            ...prev,
            faqs: prev.faqs.filter((_, i) => i !== index)
        }));
    };

    const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
        setFormData(prev => ({
            ...prev,
            faqs: prev.faqs.map((faq, i) =>
                i === index ? { ...faq, [field]: value } : faq
            )
        }));
    };

    const addSampleFAQ = (sampleFAQ: FAQItem) => {
        setFormData(prev => ({
            ...prev,
            faqs: [...prev.faqs, sampleFAQ]
        }));
    };

    return (
        <div className="artist-profile-form">
            <form onSubmit={handleSubmit} className="artist-form">
                {/* Selected Plan Display */}
                {selectedPlan && (
                    <div className="plan-display">
                        <h2 className="plan-display-title">Избран план</h2>
                        <div className="plan-display-content">
                            <div className="plan-display-info">
                                <h3>{selectedPlan.displayName}</h3>
                                <p>{selectedPlan.description}</p>
                            </div>
                            <div className="plan-display-price">
                                <h2>
                                    {selectedPlan.name === 'Hobby' ? '0' : selectedPlan.monthlyPrice.toFixed(0)}€
                                </h2>
                                <p>
                                    {selectedPlan.name === 'Hobby' ? 'Безплатно' : 'на месец'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Personal Information */}
                <div className="form-section">
                    <h2 className="form-title">Лична информация</h2>

                    <div className="form-grid">
                        <div className="form-field">
                            <label htmlFor="name" className="form-label">
                                Име за профила <span className="required">*</span>
                                <Tooltip content="Изберете подходящо име за профила си, защото ще се показва в профила ви на артист">
                                    <button type="button" className="tooltip-button">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="tooltip-icon">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </Tooltip>
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="form-input"
                                placeholder="Вашето име"
                            />
                            {errors.name && <p className="error-message">{errors.name}</p>}
                        </div>

                        <div className="form-field">
                            <label htmlFor="email" className="form-label">
                                Имейл адрес <span className="required">*</span>
                                <Tooltip content="Имейлът ще се използва за комуникация с клиенти и за получаване на уведомления">
                                    <button type="button" className="tooltip-button">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="tooltip-icon">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </Tooltip>
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="form-input"
                                placeholder="your@email.com"
                            />
                            {errors.email && <p className="error-message">{errors.email}</p>}
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="bio" className="form-label">
                            Кратка биография <span className="character-count">({formData.bio.length}/750)</span>
                            <Tooltip content="Опишете себе си и своята творческа визия. Това ще помогне на клиентите да ви опознаят по-добре">
                                <button type="button" className="tooltip-button">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="tooltip-icon">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </Tooltip>
                        </label>
                        <textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            rows={6}
                            maxLength={750}
                            className="form-textarea"
                            placeholder="Разкажете за себе си, своята творческа визия и какво ви вдъхновява..."
                        />
                        {errors.bio && <p className="error-message">{errors.bio}</p>}
                    </div>

                    <div className="form-grid">
                        <div className="form-field">
                            <label htmlFor="phoneNumber" className="form-label">
                                Телефонен номер <span className="required">*</span>
                                <Tooltip content="Телефонът ще се използва за директна комуникация с клиенти">
                                    <button type="button" className="tooltip-button">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="tooltip-icon">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </Tooltip>
                            </label>
                            <PhoneInput
                                international
                                defaultCountry="BG"
                                value={formData.phoneNumber}
                                onChange={(value) => {
                                    setFormData(prev => ({ ...prev, phoneNumber: value || "" }));
                                    setIsValidPhone(value ? isValidPhoneNumber(value) : false);
                                }}
                                className="phone-input"
                            />
                            {errors.phoneNumber && <p className="error-message">{errors.phoneNumber}</p>}
                        </div>

                        <div className="form-field">
                            <label htmlFor="birthDate" className="form-label">
                                Дата на раждане
                                <Tooltip content="Датата на раждане е опционална и може да се скрие от публичния профил">
                                    <button type="button" className="tooltip-button">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="tooltip-icon">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </Tooltip>
                            </label>
                            <input
                                type="date"
                                id="birthDate"
                                value={formData.birthDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                                className="form-input"
                            />
                            <div className="form-checkbox">
                                <label htmlFor="showBirthDate" className="custom-checkbox-container">
                                    <input
                                        type="checkbox"
                                        id="showBirthDate"
                                        checked={formData.showBirthDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, showBirthDate: e.target.checked }))}
                                        className="custom-checkbox-input"
                                    />
                                    <div className="custom-checkbox">
                                        <svg
                                            className="custom-checkbox-icon"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                        >
                                            <path
                                                d="M13.5 4.5L6 12L2.5 8.5"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                </label>
                                <span className="form-checkbox-label">
                                    Покажи датата на раждане в профила
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-field">
                            <label htmlFor="country" className="form-label">
                                Държава на произход
                                <Tooltip content="Държавата, от която произхождате или където създавате своите творби">
                                    <button type="button" className="tooltip-button">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="tooltip-icon">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </Tooltip>
                            </label>
                            <input
                                type="text"
                                id="country"
                                value={formData.country}
                                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                                className="form-input"
                                placeholder="България"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="city" className="form-label">
                                Град (опционално)
                                <Tooltip content="Градът, в който живеете или работите">
                                    <button type="button" className="tooltip-button">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="tooltip-icon">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </Tooltip>
                            </label>
                            <input
                                type="text"
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                className="form-input"
                                placeholder="София"
                            />
                        </div>
                    </div>
                </div>


                {/* FAQ Section */}
                <div className="faq-section">
                    <div className="faq-header">
                        <h2 className="faq-title">Често задавани въпроси</h2>
                        <button
                            type="button"
                            onClick={addFAQ}
                            className="faq-add-button"
                        >
                            Добави въпрос
                        </button>
                    </div>

                    <p className="faq-description">
                        Добавете въпроси и отговори, които клиентите често задават за вас и вашите творби.
                    </p>

                    {/* Sample FAQs */}
                    <div className="sample-faqs">
                        <h3 className="sample-faqs-title">Примерни въпроси:</h3>
                        <div className="sample-faqs-grid">
                            {sampleFAQs.map((faq, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => addSampleFAQ(faq)}
                                    className="sample-faq-button"
                                >
                                    <p className="sample-faq-text">{faq.question}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom FAQs */}
                    {formData.faqs.map((faq, index) => (
                        <div key={index} className="faq-item">
                            <div className="faq-item-header">
                                <h4 className="faq-item-title">Въпрос {index + 1}</h4>
                                <button
                                    type="button"
                                    onClick={() => removeFAQ(index)}
                                    className="faq-remove-button"
                                >
                                    Премахни
                                </button>
                            </div>
                            <div className="faq-inputs">
                                <input
                                    type="text"
                                    value={faq.question}
                                    onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                                    placeholder="Въпрос..."
                                    className="faq-input"
                                />
                                <textarea
                                    value={faq.answer}
                                    onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                                    placeholder="Отговор..."
                                    rows={3}
                                    className="faq-textarea"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="submit-section">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="form-button"
                    >
                        {isSubmitting ? "Създаване на профил..." : "Създай профил на артист"}
                    </button>
                </div>
            </form>
        </div>
    );
}

