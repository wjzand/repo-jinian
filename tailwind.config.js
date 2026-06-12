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
        warm: {
          50: "#FFF8F3",
          100: "#FFEFE0",
          200: "#FFD9B8",
          300: "#FFBE85",
          400: "#FF9A52",
          500: "#FF7B2E",
          600: "#F05C00",
          700: "#C74A00",
          800: "#9E3B00",
          900: "#7A2E00",
        },
        coral: {
          400: "#FF8A7A",
          500: "#FF6B6B",
          600: "#E85555",
        },
        mint: {
          400: "#6ED5CD",
          500: "#4ECDC4",
          600: "#3BB5AD",
        },
        cream: {
          50: "#FFFBF5",
          100: "#FFF5E6",
          200: "#FFEFD4",
        },
        blush: {
          100: "#FFE8E8",
          200: "#FFD4D4",
          300: "#FFB8B8",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0, 0, 0, 0.06)",
        card: "0 2px 12px rgba(0, 0, 0, 0.08)",
        float: "0 8px 30px rgba(0, 0, 0, 0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "bounce-in": "bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
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
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
