/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background, #f7f2ea)",
        foreground: "var(--color-foreground, #2d1810)",
        card: {
          DEFAULT: "var(--color-card, #ffffff)",
          foreground: "var(--color-foreground, #2d1810)",
        },
        primary: {
          DEFAULT: "var(--color-primary, #b86b2b)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "rgba(93, 58, 38, 0.06)",
          foreground: "var(--color-muted-foreground, #6e5548)",
        },
        border: "var(--color-border, rgba(93, 58, 38, 0.12))",
        ring: "var(--color-ring, #b86b2b)",
        coffee: {
          50: "#faf6f0",
          100: "#f5ece0",
          200: "#ede0d0",
          300: "#dec8b2",
          400: "#caaa8e",
          500: "#b86b2b",
          600: "#9c5720",
          700: "#7b431a",
          800: "#543015",
          900: "#2d1810",
        },
        gold: {
          light: "#e5a759",
          DEFAULT: "#b86b2b",
          dark: "#96521e",
        },
      },
      fontFamily: {
        sans: ["Outfit", "Mukta", "sans-serif"],
        hindi: ["Mukta", "Anek Devanagari", "sans-serif"],
        urdu: ["Noto Nastaliq Urdu", "serif"],
        serif: ["Cinzel", "serif"],
      },
      borderRadius: {
        lg: "var(--radius, 1.25rem)",
        md: "calc(var(--radius, 1.25rem) - 4px)",
        sm: "calc(var(--radius, 1.25rem) - 8px)",
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
}
