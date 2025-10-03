export interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

export interface FAQSection {
    id: string;
    title: string;
    items: FAQItem[];
}
