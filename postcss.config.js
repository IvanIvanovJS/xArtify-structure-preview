// postcss.config.js
module.exports = {
    plugins: {
        tailwindcss: {},
        '@tailwindcss/postcss': {}, // <-- Променете 'tailwindcss' на '@tailwindcss/postcss'
        autoprefixer: {},
    },
};