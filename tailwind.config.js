/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                'olive-green': '#6B7F4C',
                'sage-green': '#8B9A6C',
                'warm-cream': '#FFF8F0',
                'light-beige': '#F5E6D3',
                'medium-beige': '#E8D5BC',
            },
            fontFamily: {
                'heading': ['Playfair Display', 'serif'],
                'body': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            }
        },
    },
    daisyui: {
        themes: [
            {
                pastahaus: {
                    "primary": "#6B7F4C",
                    "secondary": "#E8D5BC",
                    "accent": "#8B9A6C",
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