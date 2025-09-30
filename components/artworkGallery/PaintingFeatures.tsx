"use client";

import "./styles/painting-features.css";

interface PaintingFeaturesProps {
    className?: string;
}

export default function PaintingFeatures({
    className = ""
}: PaintingFeaturesProps): React.JSX.Element {
    const features = [
        {
            id: 'collector-value',
            icon: 'diamond',
            text: 'Колекционерска стойност',
            description: 'Оригинално произведение на изкуството'
        },
        {
            id: 'original-canvas',
            icon: 'canvas',
            text: 'Оригинално платно',
            description: 'Автентично платно от художника'
        },
        {
            id: 'return-policy',
            icon: 'return',
            text: 'Право на връщане',
            description: '14 дни за връщане'
        },
        {
            id: 'express-delivery',
            icon: 'delivery',
            text: 'Експресна доставка',
            description: 'Бърза и сигурна доставка'
        }
    ];

    return (
        <div className={`painting-features ${className}`}>
            <div className="painting-features-grid">
                {features.map((feature) => (
                    <div key={feature.id} className="painting-feature">
                        <div className="painting-feature-icon">
                            {getFeatureIcon(feature.icon)}
                        </div>
                        <div className="painting-feature-content">
                            <span className="painting-feature-text">{feature.text}</span>
                            <span className="painting-feature-description">{feature.description}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getFeatureIcon(iconType: string): React.JSX.Element {
    switch (iconType) {
        case 'diamond':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
                    <path d="M11 3L8 9l4 12 4-12-3-6" />
                    <path d="M2 9h20" />
                </svg>
            );
        case 'canvas':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <path d="M9 9h6v6H9z" />
                    <path d="M9 3v6" />
                    <path d="M15 3v6" />
                    <path d="M9 15v6" />
                    <path d="M15 15v6" />
                </svg>
            );
        case 'return':
            return (
                <div className="painting-feature-return-icon">
                    <span className="painting-feature-return-number">14</span>
                </div>
            );
        case 'delivery':
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13" />
                    <path d="M16 8h4l3 3v5h-7V8z" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
            );
        default:
            return <></>;
    }
}
