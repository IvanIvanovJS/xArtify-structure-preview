"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function HomeFAQ(): React.JSX.Element {
    return (
        <section className="home-faq">
            <div className="home-faq-container">
                {/* Image */}
                <div className="home-faq-image">
                    <Image
                        src="/faq-tablet3.svg"
                        alt="FAQ - Често задавани въпроси"
                        width={400}
                        height={300}
                        className="home-faq-tablet"
                        priority={false}
                    />
                </div>

                {/* Content */}
                <div className="home-faq-content">
                    <div className="home-faq-header">
                        <h2 className="home-faq-title">
                            <span className="home-faq-title-primary">ЧЕСТО ЗАДАВАНИ</span>
                            <span className="home-faq-title-secondary">ВЪПРОСИ</span>
                        </h2>
                    </div>

                    <p className="home-faq-description">
                        Намерете отговори на най-често задаваните въпроси за нашата платформа.
                        От покупка на картини до курсове и доставка - всичко, което трябва да знаете.
                    </p>

                    <div className="home-faq-cta">
                        <Link href="/faq" className="home-faq-button">
                            <span>Виж всички въпроси</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
