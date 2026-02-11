export default {
  content: ["./index.html", "./packages/*/src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'weather-blue': '#3b82f6',
        'weather-dark': '#1e3a8a',
        'weather-light': '#dbeafe'
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      }
    },
  },
  plugins: [],
}
