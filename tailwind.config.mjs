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
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'glow': '0 0 20px rgba(107, 127, 76, 0.3)',
                'lifted': '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
                'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'slide-up': 'slideUp 0.5s ease-out',
                'fade-in': 'fadeIn 0.5s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
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