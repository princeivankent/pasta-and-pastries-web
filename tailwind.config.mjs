/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui"

export default {
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
                    "primary-content": "#ffffff",
                    "secondary": "#E8D5BC",
                    "secondary-content": "#3D3D3D",
                    "accent": "#8B9A6C",
                    "accent-content": "#ffffff",
                    "neutral": "#3D3D3D",
                    "neutral-content": "#ffffff",
                    "base-100": "#FFF8F0",
                    "base-200": "#F5E6D3",
                    "base-300": "#E8D5BC",
                    "base-content": "#3D3D3D",
                    "info": "#3ABFF8",
                    "info-content": "#ffffff",
                    "success": "#36D399",
                    "success-content": "#ffffff",
                    "warning": "#FBBD23",
                    "warning-content": "#3D3D3D",
                    "error": "#F87272",
                    "error-content": "#ffffff",
                },
            },
        ],
        darkTheme: false,
        base: true,
        styled: true,
        utils: true,
        logs: false,
    },
    plugins: [daisyui],
}