/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                'accent-red': '#B23A48',
                'warm-cream': '#FFF8F0',
                'light-beige': '#F5E6D3',
                'medium-beige': '#E8D5BC',
            }
        },
    },
    daisyui: {
        themes: [
            {
                pastahaus: {
                    "primary": "#B23A48",
                    "secondary": "#E8D5BC",
                    "accent": "#D4A574",
                    "neutral": "#3D3D3D",
                    "base-100": "#FFF8F0",
                    "base-200": "#F5E6D3",
                    "base-300": "#E8D5BC",
                    "info": "#3ABFF8",
                    "success": "#36D399",
                    "warning": "#FBBD23",
                    "error": "#F87272",
                },
            },
        ],
        darkTheme: false, // Disable dark mode
        base: true,
        styled: true,
        utils: true,
    },
    plugins: [require("daisyui")],
}