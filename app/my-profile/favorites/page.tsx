"use client";

import { JSX } from "react";

export default function FavoritesPage(): JSX.Element {
    return (
        <div>
            <div className="profile-dashboard__page-header">
                <h1 className="profile-dashboard__page-title">Любими произведения</h1>
                <p className="profile-dashboard__page-description">
                    Преглед на всички запазени произведения
                </p>
            </div>

            <div className="profile-dashboard__loading">
                <p>Тази функционалност ще бъде добавена скоро...</p>
            </div>
        </div>
    );
}
