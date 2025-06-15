
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'primary': ['var(--font-primary)', 'sans-serif'],
        'secondary': ['var(--font-secondary)', 'sans-serif'],
        'heading': ['var(--font-primary)', 'sans-serif'],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Legacy color system for shadcn compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Brand colors with CSS variable support
        primary: {
          DEFAULT: "var(--color-primary)",
          50: "#e6f2ff",
          100: "#b3d9ff",
          200: "#80c0ff",
          300: "#4da7ff",
          400: "#1a8eff",
          500: "#005288",
          600: "#004070",
          700: "#003058",
          800: "#002040",
          900: "#001028",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          50: "#f4fce6",
          100: "#e6f7b3",
          200: "#d8f280",
          300: "#caed4d",
          400: "#bce81a",
          500: "#8CC63F",
          600: "#6fa030",
          700: "#527a24",
          800: "#355418",
          900: "#182e0c",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          50: "#fff4e6",
          100: "#ffe4b3",
          200: "#ffd480",
          300: "#ffc44d",
          400: "#ffb41a",
          500: "#FF6B00",
          600: "#e55a00",
          700: "#cc4900",
          800: "#b33800",
          900: "#992700",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "blob": {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "slide-up": "slide-up 0.6s ease-out",
        "bounce-in": "bounce-in 0.6s ease-out",
        "float": "float 6s ease-in-out infinite",
        "blob": "blob 7s infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(0, 82, 136, 0.15)',
        'accent': '0 4px 14px 0 rgba(255, 107, 0, 0.15)',
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px 0 rgba(0, 0, 0, 0.12)',
        'hard': '0 8px 32px 0 rgba(0, 0, 0, 0.16)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
        'accent-gradient': 'linear-gradient(135deg, var(--color-accent) 0%, #ff8533 100%)',
        'hero-gradient': 'linear-gradient(45deg, rgba(0, 82, 136, 0.9), rgba(140, 198, 63, 0.9))',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
