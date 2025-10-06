"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SubscriptionPlan, User } from "@prisma/client";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";
import { Tooltip } from "@/components/ui/Tooltip";
import "./styles/artist-profile-form.css";

interface ArtistProfileFormProps {
    userId: string;
    userData: Pick<User, 'name' | 'email' | 'image'> | null;
    selectedPlan: SubscriptionPlan | null;
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

export default function ArtistProfileForm({ userId, userData, selectedPlan }: ArtistProfileFormProps) {
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
                    planId: selectedPlan?.id
                }),
            });

            if (response.ok) {
                const result = await response.json();
                await update({ ...userData, isArtist: true });

                if (selectedPlan?.name === 'Free') {
                    // For free plan, redirect directly to artist profile
                    router.push(`/artists/${result.artistProfile.id}`);
                } else {
                    // For paid plans, redirect to payment page
                    router.push(`/become-an-artist/payment?artistId=${result.artistProfile.id}&planId=${selectedPlan?.id}`);
                }
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
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Selected Plan Display */}
                {selectedPlan && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <h2 className="text-xl font-semibold text-white mb-2">Избран план</h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-cyan-400 font-medium">{selectedPlan.displayName}</p>
                                <p className="text-gray-300 text-sm">{selectedPlan.description}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-white">
                                    {selectedPlan.name === 'Free' ? '0' : selectedPlan.monthlyPrice.toFixed(0)}€
                                </p>
                                <p className="text-gray-300 text-sm">
                                    {selectedPlan.name === 'Free' ? 'Безплатно' : 'на месец'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Personal Information */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-6">Лична информация</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                                Име за профила <span className="text-red-500">*</span>
                                <Tooltip content="Изберете подходящо име за профила си, защото ще се показва в профила ви на артист">
                                    <button type="button" className="ml-2 text-cyan-400 hover:text-cyan-300">
                                        ℹ️
                                    </button>
                                </Tooltip>
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                placeholder="Вашето име"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                                Имейл адрес <span className="text-red-500">*</span>
                                <Tooltip content="Имейлът ще се използва за комуникация с клиенти и за получаване на уведомления">
                                    <button type="button" className="ml-2 text-cyan-400 hover:text-cyan-300">
                                        ℹ️
                                    </button>
                                </Tooltip>
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                placeholder="your@email.com"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                        </div>
                    </div>

                    <div className="mt-6">
                        <label htmlFor="bio" className="block text-sm font-medium text-white mb-2">
                            Кратка биография <span className="text-gray-400">({formData.bio.length}/750)</span>
                            <Tooltip content="Опишете себе си и своята творческа визия. Това ще помогне на клиентите да ви опознаят по-добре">
                                <button type="button" className="ml-2 text-cyan-400 hover:text-cyan-300">
                                    ℹ️
                                </button>
                            </Tooltip>
                        </label>
                        <textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            rows={6}
                            maxLength={750}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                            placeholder="Разкажете за себе си, своята творческа визия и какво ви вдъхновява..."
                        />
                        {errors.bio && <p className="mt-1 text-sm text-red-400">{errors.bio}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-white mb-2">
                                Телефонен номер <span className="text-red-500">*</span>
                                <Tooltip content="Телефонът ще се използва за директна комуникация с клиенти">
                                    <button type="button" className="ml-2 text-cyan-400 hover:text-cyan-300">
                                        ℹ️
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
                            {errors.phoneNumber && <p className="mt-1 text-sm text-red-400">{errors.phoneNumber}</p>}
                        </div>

                        <div>
                            <label htmlFor="birthDate" className="block text-sm font-medium text-white mb-2">
                                Дата на раждане
                                <Tooltip content="Датата на раждане е опционална и може да се скрие от публичния профил">
                                    <button type="button" className="ml-2 text-cyan-400 hover:text-cyan-300">
                                        ℹ️
                                    </button>
                                </Tooltip>
                            </label>
                            <input
                                type="date"
                                id="birthDate"
                                value={formData.birthDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                            <div className="mt-2 flex items-center">
                                <input
                                    type="checkbox"
                                    id="showBirthDate"
                                    checked={formData.showBirthDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, showBirthDate: e.target.checked }))}
                                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-white/20 rounded bg-white/10"
                                />
                                <label htmlFor="showBirthDate" className="ml-2 text-sm text-white">
                                    Покажи датата на раждане в профила
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-white mb-2">
                                Държава на произход
                                <Tooltip content="Държавата, от която произхождате или където създавате своите творби">
                                    <button type="button" className="ml-2 text-cyan-400 hover:text-cyan-300">
                                        ℹ️
                                    </button>
                                </Tooltip>
                            </label>
                            <input
                                type="text"
                                id="country"
                                value={formData.country}
                                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                placeholder="България"
                            />
                        </div>

                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-white mb-2">
                                Град (опционално)
                                <Tooltip content="Градът, в който живеете или работите">
                                    <button type="button" className="ml-2 text-cyan-400 hover:text-cyan-300">
                                        ℹ️
                                    </button>
                                </Tooltip>
                            </label>
                            <input
                                type="text"
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                placeholder="София"
                            />
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-6">Настройки за сигурност</h2>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div>
                            <h3 className="text-lg font-medium text-white">Двуфакторна верификация</h3>
                            <p className="text-gray-300 text-sm">
                                Добавете допълнителна защита към профила си
                            </p>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isTwoFactorEnabled"
                                checked={formData.isTwoFactorEnabled}
                                onChange={(e) => setFormData(prev => ({ ...prev, isTwoFactorEnabled: e.target.checked }))}
                                className="h-5 w-5 text-cyan-600 focus:ring-cyan-500 border-white/20 rounded bg-white/10"
                            />
                            <label htmlFor="isTwoFactorEnabled" className="ml-3 text-sm text-white">
                                {formData.isTwoFactorEnabled ? 'Активирана' : 'Деактивирана'}
                            </label>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Често задавани въпроси</h2>
                        <button
                            type="button"
                            onClick={addFAQ}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                        >
                            Добави въпрос
                        </button>
                    </div>

                    <p className="text-gray-300 mb-6">
                        Добавете въпроси и отговори, които клиентите често задават за вас и вашите творби.
                    </p>

                    {/* Sample FAQs */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-white mb-3">Примерни въпроси:</h3>
                        <div className="grid md:grid-cols-2 gap-2">
                            {sampleFAQs.map((faq, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => addSampleFAQ(faq)}
                                    className="p-3 text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                                >
                                    <p className="text-white text-sm font-medium">{faq.question}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom FAQs */}
                    {formData.faqs.map((faq, index) => (
                        <div key={index} className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-white font-medium">Въпрос {index + 1}</h4>
                                <button
                                    type="button"
                                    onClick={() => removeFAQ(index)}
                                    className="text-red-400 hover:text-red-300 text-sm"
                                >
                                    Премахни
                                </button>
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={faq.question}
                                    onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                                    placeholder="Въпрос..."
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                                <textarea
                                    value={faq.answer}
                                    onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                                    placeholder="Отговор..."
                                    rows={3}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Създаване на профил..." : "Създай профил на артист"}
                    </button>
                </div>
            </form>
        </div>
    );
}

