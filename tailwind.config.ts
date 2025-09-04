import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/styles/**/*.{css}",
    ],
    darkMode: ["class", '[data-theme="dark"]'],
    theme: {
        container: {
            center: true,
            padding: "1rem",
            screens: {
                sm: "640px",
                md: "768px",
                lg: "1024px",
                xl: "1280px",
            },
        },
        extend: {
            colors: {
                // работим с CSS променливи за лесно theming (light/dark)
                bg: "hsl(var(--bg))",
                fg: "hsl(var(--fg))",
                muted: "hsl(var(--muted))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    fg: "hsl(var(--primary-fg))",
                },
                ring: "hsl(var(--ring))",
                border: "hsl(var(--border))",
                card: "hsl(var(--card))",
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.25rem",
            },
            boxShadow: {
                soft: "0 8px 30px rgba(0,0,0,0.08)",
            },
            fontFamily: {
                sans: ["var(--font-sans)", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
export default config;
