"use client";

import { JSX } from "react";

export default function WalletPage(): JSX.Element {
    return (
        <div>
            <div className="profile-dashboard__page-header">
                <h1 className="profile-dashboard__page-title">Портфейл</h1>
                <p className="profile-dashboard__page-description">
                    Управление на плащания и баланс
                </p>
            </div>

            <div className="profile-dashboard__loading">
                <p>Тази функционалност ще бъде добавена скоро...</p>
            </div>
        </div>
    );
}
