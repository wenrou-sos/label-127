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
        forest: {
          50: "#f0f5f2",
          100: "#dbe8e1",
          200: "#b7d1c4",
          300: "#88b3a0",
          400: "#558f78",
          500: "#356f59",
          600: "#275947",
          700: "#1E4D3B",
          800: "#173d30",
          900: "#102d23",
          950: "#081913",
        },
        gold: {
          50: "#fbf6ea",
          100: "#f5e9c8",
          200: "#ecd089",
          300: "#e0b658",
          400: "#d4a438",
          500: "#C9A24B",
          600: "#a8832f",
          700: "#866529",
          800: "#6e5226",
          900: "#5d4623",
        },
        brick: {
          50: "#fbf0ed",
          100: "#f5dcd4",
          200: "#e9b5a6",
          300: "#db8b75",
          400: "#cf684d",
          500: "#B5462E",
          600: "#9a3a26",
          700: "#7d2f20",
          800: "#672821",
          900: "#56231e",
        },
        cream: {
          50: "#fdfbf7",
          100: "#F7F3EC",
          200: "#efe7d7",
          300: "#e3d5bd",
          400: "#cdbb96",
        },
        ink: {
          50: "#f6f6f5",
          100: "#e7e6e3",
          200: "#cfccc6",
          300: "#a9a49b",
          400: "#7c766b",
          500: "#5c5650",
          600: "#45413d",
          700: "#33302d",
          800: "#1f1d1b",
          900: "#131210",
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', '"Noto Serif SC"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Manrope"', '"Noto Sans SC"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: "0 1px 2px rgba(30,77,59,0.04), 0 8px 24px -8px rgba(30,77,59,0.10)",
        cardhover: "0 4px 12px rgba(30,77,59,0.08), 0 18px 40px -12px rgba(30,77,59,0.18)",
        pop: "0 12px 40px -8px rgba(19,18,16,0.22)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(181,70,46,0.45)" },
          "70%": { boxShadow: "0 0 0 10px rgba(181,70,46,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(181,70,46,0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer: "shimmer 1.6s infinite",
        "fade-up": "fade-up 0.5s ease-out both",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0.12 0 0 0 0 0.3 0 0 0 0 0.23 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
