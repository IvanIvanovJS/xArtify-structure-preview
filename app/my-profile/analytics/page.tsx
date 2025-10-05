"use client";

import { JSX } from "react";

export default function AnalyticsPage(): JSX.Element {
    return (
        <div>
            <div className="profile-dashboard__page-header">
                <h1 className="profile-dashboard__page-title">Аналитика</h1>
                <p className="profile-dashboard__page-description">
                    Статистики и отчети за вашите произведения
                </p>
            </div>

            <div className="profile-dashboard__loading">
                <p>Тази функционалност ще бъде добавена скоро...</p>
            </div>
        </div>
    );
}
