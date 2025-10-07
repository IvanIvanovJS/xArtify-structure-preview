"use client";

import { JSX } from "react";

export default function OrdersPage(): JSX.Element {
    return (
        <div>
            <div className="profile-dashboard__page-header">
                <h1 className="profile-dashboard__page-title">Моите поръчки</h1>
                <p className="profile-dashboard__page-description">
                    Преглед на всички ваши поръчки и покупки
                </p>
            </div>

            <div className="profile-dashboard__loading">
                <p>Тази функционалност ще бъде добавена скоро...</p>
            </div>
        </div>
    );
}
