"use client";

import { JSX } from "react";

export default function ArtistProfilePage(): JSX.Element {
    return (
        <div>
            <div className="profile-dashboard__page-header">
                <h1 className="profile-dashboard__page-title">Профил на артист</h1>
                <p className="profile-dashboard__page-description">
                    Управление на артистичен профил
                </p>
            </div>

            <div className="profile-dashboard__loading">
                <p>Тази функционалност ще бъде добавена скоро...</p>
            </div>
        </div>
    );
}
