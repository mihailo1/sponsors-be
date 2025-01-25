/** @type {import('tailwindcss').Config} */
module.exports = {
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: 'class', // Enable dark mode
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            backgroundColor: {
                'white-bg': '#f5f5f5',
                'black-bg': '#1a202c',
                'dark-bg': '#2d3748',
            },
            textColor: {
                'dark-text': '#c9d5e6',
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}
