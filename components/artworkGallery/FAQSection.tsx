"use client";

import { useState } from 'react';
import "./styles/faq-section.css";

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        id: "1",
        question: "Как мога да купя картина от платформата?",
        answer: "Изберете картината, която харесвате, добавете я в количката и следвайте стъпките за плащане. Приемаме плащания чрез Stripe с всички основни карти. След успешното плащане ще се свържем с вас за доставката."
    },
    {
        id: "2",
        question: "Мога ли да видя картините на живо преди покупка?",
        answer: "Да! Всички картини са с висококачествени снимки от различни ъгли. Можете да видите детайли за техниката, материалите и размерите. При желание можем да организираме виртуална среща с художника за по-подробна информация."
    },
    {
        id: "3",
        question: "Как се извършва доставката на картините?",
        answer: "Доставяме картините с професионална куриерска компания в защитена опаковка. Доставката в България е безплатна за поръчки над 200 лв. За международни доставки се свържете с нас за индивидуална оферта."
    },
    {
        id: "4",
        question: "Мога ли да върна картина, ако не ми хареса?",
        answer: "Да, имате 14 дни право на връщане от датата на получаване. Картината трябва да бъде в оригиналното си състояние. Ще върнем пълната сума, като транспортните разходи са за ваша сметка."
    },
    {
        id: "5",
        question: "Как мога да стана художник в платформата?",
        answer: "Създайте профил като художник, качвайте вашите произведения с висококачествени снимки и попълнете всички детайли. Нашият екип ще прегледа профила ви и ще ви уведоми за одобрението в рамките на 48 часа."
    },
    {
        id: "6",
        question: "Има ли гаранция за автентичността на произведенията?",
        answer: "Всички художници в платформата са верифицирани и всеки произведение идва с сертификат за автентичност. Запазваме пълна документация за всяка продажба и можем да проследим произхода на всяко произведение."
    },
    {
        id: "7",
        question: "Мога ли да заявя персонализирана картина?",
        answer: "Да! Много от нашите художници приемат персонализирани поръчки. Свържете се с нас с вашите идеи и ще ви свържем с подходящ художник. Цената се определя според сложността и размерите на поръчката."
    },
    {
        id: "8",
        question: "Как работят промоциите и намаленията?",
        answer: "Художниците могат да предлагат намаления на своите произведения. Промоционалните цени са ясно отбелязани и се прилагат автоматично при добавяне в количката. Следвайте нашите социални мрежи за ексклузивни оферти."
    }
];

export default function FAQSection(): React.JSX.Element {
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const toggleItem = (id: string): void => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(id)) {
            newOpenItems.delete(id);
        } else {
            newOpenItems.add(id);
        }
        setOpenItems(newOpenItems);
    };

    return (
        <div className="faq-section">
            <div className="faq-container">
                {/* Header */}
                <div className="faq-header">
                    <div className="faq-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <path d="M12 17h.01" />
                        </svg>
                    </div>
                    <div className="faq-title-section">
                        <div className="faq-logo">FAQ</div>
                        <h2 className="faq-main-title">
                            <span className="faq-title-cosmic">АРТИСТИЧНИ</span>
                            <span className="faq-title-queries">ВЪПРОСИ?</span>
                        </h2>
                        <p className="faq-subtitle">Отговори, които търсите</p>
                    </div>
                </div>

                {/* FAQ Items */}
                <div className="faq-items">
                    {faqData.map((item) => (
                        <div
                            key={item.id}
                            className={`faq-item ${openItems.has(item.id) ? 'faq-item-open' : ''}`}
                            onClick={() => toggleItem(item.id)}
                        >
                            <div className="faq-question">
                                <span className="faq-question-number">Q.</span>
                                <span className="faq-question-text">{item.question}</span>
                                <div className="faq-chevron">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className={`faq-chevron-icon ${openItems.has(item.id) ? 'faq-chevron-rotated' : ''}`}
                                    >
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </div>
                            </div>
                            {openItems.has(item.id) && (
                                <div className="faq-answer">
                                    <p className="faq-answer-text">{item.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
