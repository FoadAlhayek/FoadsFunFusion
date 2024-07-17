/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        FairProsper: ["FairProsper", "sans-serif"],
      },
      keyframes: {
        "shake-x": {
          "10%, 90%": { transform: "translateX(-2px)" },
          "20%, 80%": { transform: "translateX(2px)" },
          "30%, 50%, 70%": { transform: "translate(-4px)" },
          "40%, 60%": { transform: "translateX(4px)" },
        },
        "bounce-y": {
          "0%": { transform: "translateY(0)" },
          "20%": { transform: "translateY(-25px)" },
          "30%": { transform: "translateY(10px)" },
          "50%": { transform: "translateY(-10px)" },
          "60%": { transform: "translateY(2px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "shake-x": "shake-x 0.7s",
        "bounce-y": "bounce-y 1s",
      },
    },
  },
  plugins: [],
};
