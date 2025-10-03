"use client";

import { FAQSection } from './types';

interface FAQNavigationProps {
    sections: FAQSection[];
    activeSection: string;
    onSectionChange: (sectionId: string) => void;
}

export default function FAQNavigation({
    sections,
    activeSection,
    onSectionChange
}: FAQNavigationProps): React.JSX.Element {
    return (
        <div className="faq-navigation">
            <div className="faq-navigation-container">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        className={`faq-nav-item ${activeSection === section.id ? 'faq-nav-item-active' : ''}`}
                        onClick={() => onSectionChange(section.id)}
                    >
                        {section.title}
                    </button>
                ))}
            </div>
        </div>
    );
}
