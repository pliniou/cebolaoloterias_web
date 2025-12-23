import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
        // Lottery colors with light/dark scales
        megasena: {
          light: "hsl(var(--megasena-light))",
          DEFAULT: "hsl(var(--megasena))",
          dark: "hsl(var(--megasena-dark))",
        },
        quina: {
          light: "hsl(var(--quina-light))",
          DEFAULT: "hsl(var(--quina))",
          dark: "hsl(var(--quina-dark))",
        },
        lotofacil: {
          light: "hsl(var(--lotofacil-light))",
          DEFAULT: "hsl(var(--lotofacil))",
          dark: "hsl(var(--lotofacil-dark))",
        },
        lotomania: {
          light: "hsl(var(--lotomania-light))",
          DEFAULT: "hsl(var(--lotomania))",
          dark: "hsl(var(--lotomania-dark))",
        },
        duplasena: {
          light: "hsl(var(--duplasena-light))",
          DEFAULT: "hsl(var(--duplasena))",
          dark: "hsl(var(--duplasena-dark))",
        },
        timemania: {
          light: "hsl(var(--timemania-light))",
          DEFAULT: "hsl(var(--timemania))",
          dark: "hsl(var(--timemania-dark))",
        },
        diadesorte: {
          light: "hsl(var(--diadesorte-light))",
          DEFAULT: "hsl(var(--diadesorte))",
          dark: "hsl(var(--diadesorte-dark))",
        },
        supersete: {
          light: "hsl(var(--supersete-light))",
          DEFAULT: "hsl(var(--supersete))",
          dark: "hsl(var(--supersete-dark))",
        },
        federal: {
          light: "hsl(var(--federal-light))",
          DEFAULT: "hsl(var(--federal))",
          dark: "hsl(var(--federal-dark))",
        },
        loteca: {
          light: "hsl(var(--loteca-light))",
          DEFAULT: "hsl(var(--loteca))",
          dark: "hsl(var(--loteca-dark))",
        },
        maismilionaria: {
          light: "hsl(var(--maismilionaria-light))",
          DEFAULT: "hsl(var(--maismilionaria))",
          dark: "hsl(var(--maismilionaria-dark))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        flat: "var(--shadow-flat)",
        "flat-md": "var(--shadow-flat-md)",
        "flat-lg": "var(--shadow-flat-lg)",
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      },
      transitionDuration: {
        "150": "150ms",
        "250": "250ms",
        "350": "350ms",
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
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.35s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "scale-in": "scale-in 0.25s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
