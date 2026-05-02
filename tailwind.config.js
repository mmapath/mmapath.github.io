export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mma-black': '#0a0a0a',
        'mma-charcoal': '#141414',
        'mma-dark': '#1a1a1a',
        'mma-gray': '#2a2a2a',
        'mma-light-gray': '#3a3a3a',
        'mma-red': '#dc2626',
        'mma-red-light': '#ef4444',
        'mma-red-dark': '#b91c1c',
        'mma-accent': '#991b1b',
        'mma-green': '#22c55e',
      },
      fontFamily: {
        'oswald': ['Oswald', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(220, 38, 38, 0.3)',
        'glow-lg': '0 0 40px rgba(220, 38, 38, 0.4)',
      },
    },
  },
  plugins: [],
}