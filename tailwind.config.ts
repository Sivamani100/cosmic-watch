import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
        sans: ["Inter", "Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        cosmic: {
          purple: "hsl(var(--cosmic-purple))",
          blue: "hsl(var(--cosmic-blue))",
          pink: "hsl(var(--cosmic-pink))",
          cyan: "hsl(var(--cosmic-cyan))",
        },
        risk: {
          low: "hsl(var(--risk-low))",
          medium: "hsl(var(--risk-medium))",
          high: "hsl(var(--risk-high))",
          critical: "hsl(var(--risk-critical))",
        },
        space: {
          darkest: "hsl(var(--space-darkest))",
          dark: "hsl(var(--space-dark))",
          medium: "hsl(var(--space-medium))",
          light: "hsl(var(--space-light))",
        },
      },
      borderRadius: {
        lg: "5px",
        md: "5px",
        sm: "5px",
        xl: "5px",
        "2xl": "5px",
        "3xl": "5px",
        DEFAULT: "5px",
        full: "9999px", // Keep full for avatars/circles
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
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(239 84% 67% / 0.4)" },
          "50%": { boxShadow: "0 0 40px hsl(239 84% 67% / 0.6)" },
        },
        orbit: {
          from: { transform: "rotate(0deg) translateX(100px) rotate(0deg)" },
          to: { transform: "rotate(360deg) translateX(100px) rotate(-360deg)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        orbit: "orbit 20s linear infinite",
        "spin-slow": "spin 20s linear infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out",
      },
      backgroundImage: {
        "space-gradient": "linear-gradient(180deg, hsl(var(--space-darkest)) 0%, hsl(var(--space-medium)) 100%)",
        "hero-gradient": "linear-gradient(135deg, hsl(var(--cosmic-purple)) 0%, hsl(var(--cosmic-blue)) 50%, hsl(var(--cosmic-pink)) 100%)",
        "card-gradient": "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--space-dark)) 100%)",
      },
      boxShadow: {
        "glow-purple": "0 0 30px hsl(239 84% 67% / 0.4)",
        "glow-blue": "0 0 30px hsl(217 91% 60% / 0.4)",
        "glow-pink": "0 0 30px hsl(330 81% 60% / 0.4)",
        "glow-cyan": "0 0 30px hsl(185 96% 50% / 0.4)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
