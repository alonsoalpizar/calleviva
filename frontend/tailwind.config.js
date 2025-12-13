/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: '#FF6B6B',
        mango: '#FFE66D',
        agua: '#2EC4B6',
        papaya: '#FF9F43',
        hoja: '#5C8A4D',
        terracota: '#E17055',
        carbon: '#2D3436',
        crema: '#F5F0E6',
        'gris-claro': '#DFE6E9',
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
