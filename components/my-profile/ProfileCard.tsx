"use client";

import Link from "next/link";
import { JSX } from "react";
import "./styles/profile-card.css";


interface ProfileCardProps {
    title: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    href: string;
    description?: string;
    isSpecial?: boolean;
}

export default function ProfileCard({
    title,
    icon: Icon,
    href,
    description,
    isSpecial = false
}: ProfileCardProps): JSX.Element {
    return (
        <Link href={href} className={`profile-card ${isSpecial ? 'profile-card--special' : ''}`}>
            <div className="profile-card__content">
                <div className="profile-card__icon">
                    <Icon size={24} className="profile-card__icon-svg" aria-hidden="true" />
                </div>
                <div className="profile-card__text">
                    <h3 className="profile-card__title">{title}</h3>
                    {description && (
                        <p className="profile-card__description">{description}</p>
                    )}
                </div>
                <div className="profile-card__arrow">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="arrow-icon"
                        aria-hidden="true"
                    >
                        <path
                            d="M9 18L15 12L9 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
        </Link>
    );
}
