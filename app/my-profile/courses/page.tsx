"use client";

import { JSX } from "react";

export default function CoursesPage(): JSX.Element {
    return (
        <div>
            <div className="profile-dashboard__page-header">
                <h1 className="profile-dashboard__page-title">Моите курсове</h1>
                <p className="profile-dashboard__page-description">
                    Преглед на всички закупени курсове
                </p>
            </div>

            <div className="profile-dashboard__loading">
                <p>Тази функционалност ще бъде добавена скоро...</p>
            </div>
        </div>
    );
}
