// components/background/SiteBackground.tsx
import React, { JSX } from "react";

export default function SiteBackground(): JSX.Element {
    return (
        <div aria-hidden="true" className="bg-stars">
            {/* Shooting stars (3 броя, редки и леки) */}
            <span className="shooting-star shooting-star--a" />
            <span className="shooting-star shooting-star--b" />
            <span className="shooting-star shooting-star--c" />
        </div>
    );
}
