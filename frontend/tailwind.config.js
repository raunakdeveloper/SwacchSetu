export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeSlide: {
          "0%": { opacity: 0 },
          "8%": { opacity: 1 },
          "25%": { opacity: 1 },
          "33%": { opacity: 0 },
          "100%": { opacity: 0 },
        },
      },
      animation: {
        fadeSlide: "fadeSlide 36s infinite",
      },
    }
  },
  plugins: [],
}
