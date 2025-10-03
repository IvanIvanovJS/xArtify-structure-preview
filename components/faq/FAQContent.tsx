"use client";

import { useState } from 'react';
import { FAQSection } from './types';

interface FAQContentProps {
    section: FAQSection;
}

export default function FAQContent({ section }: FAQContentProps): React.JSX.Element {
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
        <div className="faq-content">
            <div className="faq-content-container">
                <div className="faq-items">
                    {section.items.map((item) => (
                        <div
                            key={item.id}
                            className={`faq-item ${openItems.has(item.id) ? 'faq-item-open' : ''}`}
                            onClick={() => toggleItem(item.id)}
                        >
                            <div className="faq-question">
                                <span className="faq-question-number">В.</span>
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
