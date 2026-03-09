/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'zen-pink': '#EC4899',
                'zen-blue': '#3B82F6',
                'zen-teal': '#0D9488',
                'zen-bg': '#020617',
            },
            fontFamily: {
                display: ['Orbitron', 'system-ui', 'sans-serif'],
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                mono: ['Space Mono', 'ui-monospace', 'monospace'],
            }
        },
    },
    plugins: [],
}
