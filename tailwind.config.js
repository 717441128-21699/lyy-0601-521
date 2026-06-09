/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#E8EEF5",
          100: "#D1DDEA",
          200: "#A4BBD5",
          300: "#7699C0",
          400: "#4977AB",
          500: "#1E3A5F",
          600: "#182E4C",
          700: "#122339",
          800: "#0C1726",
          900: "#060C13",
        },
        accent: {
          50: "#FFF0EA",
          100: "#FFE1D5",
          200: "#FFC3AB",
          300: "#FFA581",
          400: "#FF8858",
          500: "#FF6B35",
          600: "#CC552A",
          700: "#994020",
          800: "#662A15",
          900: "#33150B",
        },
        success: {
          50: "#E8F8F6",
          100: "#D1F1EC",
          200: "#A3E3D9",
          300: "#75D5C6",
          400: "#47C7B3",
          500: "#2EC4B6",
          600: "#259D92",
          700: "#1C766D",
          800: "#124E49",
          900: "#092724",
        },
        warning: {
          50: "#FFF8EA",
          100: "#FFF1D5",
          200: "#FFE3AB",
          300: "#FFD581",
          400: "#FFC758",
          500: "#FFB627",
          600: "#CC921F",
          700: "#996D17",
          800: "#664910",
          900: "#332408",
        },
        background: {
          start: "#F8FAFC",
          end: "#EEF2F7",
        },
      },
      fontFamily: {
        display: ['"Noto Serif SC"', "serif"],
        sans: ['"Inter"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)",
        "card-hover": "0 4px 6px rgba(0,0,0,0.07), 0 10px 30px rgba(0,0,0,0.05)",
        float: "0 8px 24px rgba(30, 58, 95, 0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-right": "slideRight 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "bounce-soft": "bounceSoft 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bounceSoft: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
