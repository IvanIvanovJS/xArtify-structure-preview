"use client";

import { JSX } from "react";

export default function NotificationsPage(): JSX.Element {
    return (
        <div>
            <div className="profile-dashboard__page-header">
                <h1 className="profile-dashboard__page-title">Известия</h1>
                <p className="profile-dashboard__page-description">
                    Настройки за известия и съобщения
                </p>
            </div>

            <div className="profile-dashboard__loading">
                <p>Тази функционалност ще бъде добавена скоро...</p>
            </div>
        </div>
    );
}
