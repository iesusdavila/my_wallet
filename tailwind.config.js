/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        bg: '#15171d',
        surface: '#21252d',
        surfaceAlt: '#2b313b',
        sidebar: '#1b1f27',
        text: '#e9ecf3',
        muted: '#a6afbd',
        primary: '#9ca9d8',
        success: '#8ebea7',
        warning: '#d2a76f',
        danger: '#c9929a',
      },
      boxShadow: {
        card: '0 10px 30px rgba(7, 9, 13, 0.35)',
        soft: '0 4px 14px rgba(6, 8, 12, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
