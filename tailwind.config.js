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
          50: "#E6F0FA",
          100: "#BFD7F2",
          200: "#99BEEA",
          300: "#73A5E2",
          400: "#4D8CD9",
          500: "#0066CC",
          600: "#0052A3",
          700: "#003D7A",
          800: "#002952",
          900: "#001429",
        },
        success: {
          50: "#E6F9F1",
          100: "#B3EFDA",
          200: "#80E5C3",
          300: "#4DDBAC",
          400: "#1AD195",
          500: "#00B578",
          600: "#009160",
          700: "#006D48",
          800: "#004930",
          900: "#002418",
        },
        warning: {
          50: "#FFF0E8",
          100: "#FFD4BF",
          200: "#FFB799",
          300: "#FF9B73",
          400: "#FF7E4D",
          500: "#FF6B35",
          600: "#CC562A",
          700: "#994020",
          800: "#662B15",
          900: "#33150B",
        },
        dark: {
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
        },
      },
      fontFamily: {
        sans: ["Noto Sans SC", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "number-roll": "numberRoll 0.5s ease-out",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "card-hover": "cardHover 0.2s ease-out",
      },
      keyframes: {
        numberRoll: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        cardHover: {
          "0%": { transform: "translateY(0)", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
          "100%": { transform: "translateY(-2px)", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" },
        },
      },
    },
  },
  plugins: [],
};
