// components/background/SiteBackground.tsx
import React, { JSX, useMemo } from "react";

type CSSVarKey =
    | "--spot1-x" | "--spot1-y"
    | "--spot2-x" | "--spot2-y";

type ContainerVars = React.CSSProperties & Record<CSSVarKey, string>;

function pick(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export default function SiteBackground(): JSX.Element {
    // Генерираме позиции веднъж (SSR → имаме fallback от CSS)
    const {
        spot1X, spot1Y, spot2X, spot2Y,
        grain1, grain2,
    } = useMemo(() => {
        // Мъгла: две „облака“ с разумно разделение
        let s1 = { x: pick(60, 88), y: pick(12, 36) }; // горе-дясно
        let s2 = { x: pick(12, 40), y: pick(60, 88) }; // долу-ляво

        if (distance(s1, s2) < 40) {
            // ако са прекалено близо, преместваме второто
            s2 = { x: pick(12, 36), y: pick(62, 88) };
        }

        // Grain петна (центрове), пазим ги на разстояние от мъглата
        let g1 = { x: pick(65, 85), y: pick(18, 38) };
        let g2 = { x: pick(15, 35), y: pick(65, 85) };

        // гарантираме разстояние м/у двата grain центъра
        if (distance(g1, g2) < 28) {
            g2 = { x: pick(15, 30), y: pick(70, 88) };
        }

        return {
            spot1X: `${s1.x}%`,
            spot1Y: `${s1.y}%`,
            spot2X: `${s2.x}%`,
            spot2Y: `${s2.y}%`,
            grain1: g1,
            grain2: g2,
        };
    }, []);

    const containerStyle: ContainerVars = {
        ["--spot1-x"]: spot1X,
        ["--spot1-y"]: spot1Y,
        ["--spot2-x"]: spot2X,
        ["--spot2-y"]: spot2Y,
    };

    return (
        <div aria-hidden="true" className="bg-stars" style={containerStyle}>
            {/* Две локални grain петна (без анимации) */}
            <span
                className="grain-spot grain-spot--1"
                style={{
                    // позиция на центъра (проценти спрямо viewport)
                    // ползваме left/top + translate(-50%,-50%) от CSS
                    // стойностите са числа 0–100 → % в стринг:
                    // (без 'any', само валидни CSSProperties)
                    left: `${grain1.x}%`,
                    top: `${grain1.y}%`,
                }}
            />
            <span
                className="grain-spot grain-spot--2"
                style={{
                    left: `${grain2.x}%`,
                    top: `${grain2.y}%`,
                }}
            />
        </div>
    );
}
