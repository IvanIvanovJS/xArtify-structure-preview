"use client";

import { JSX } from "react";

export default function MyArtworksPage(): JSX.Element {
    return (
        <div>
            <div className="profile-dashboard__page-header">
                <h1 className="profile-dashboard__page-title">Моите произведения</h1>
                <p className="profile-dashboard__page-description">
                    Управление на вашите произведения
                </p>
            </div>

            <div className="profile-dashboard__loading">
                <p>Тази функционалност ще бъде добавена скоро...</p>
            </div>
        </div>
    );
}
