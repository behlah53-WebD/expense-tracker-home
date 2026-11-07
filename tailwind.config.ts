import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "16px",
        md: "24px",
        lg: "32px",
      },
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-sora)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        background: {
          DEFAULT: "var(--bg-base)",
          elevated: "var(--bg-elevated)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
        },
        border: "var(--border)",
        text: {
          heading: "var(--text-heading)",
          body: "var(--text-body)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          gold: "var(--text-gold)",
          primary: "var(--text-heading)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          glow: "var(--primary-glow)",
        },
        income: {
          DEFAULT: "var(--income)",
          text: "var(--income-text)",
          deep: "var(--income-deep)",
        },
        expense: {
          DEFAULT: "var(--expense)",
          text: "var(--expense-text)",
          deep: "var(--expense-deep)",
        },
        accent: {
          cyan: "var(--accent-cyan)",
          gold: "var(--accent-gold)",
        },
        danger: "var(--danger)",
        success: "var(--success)",
      },
      borderRadius: {
        card: "24px",
        inner: "16px",
        btn: "14px",
        input: "14px",
        badge: "8px",
        full: "9999px",
      },
      transitionTimingFunction: {
        aurora: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        150: "150ms",
        250: "250ms",
        500: "500ms",
      },
      boxShadow: {
        glass: "var(--shadow-glass)",
        "glass-hover": "var(--shadow-glass-hover)",
        "glow-violet": "0 0 25px rgba(124, 92, 255, 0.4)",
        "glow-cyan": "0 0 25px rgba(56, 213, 255, 0.4)",
        "glow-mint": "0 0 25px rgba(46, 242, 176, 0.4)",
        "glow-coral": "0 0 25px rgba(255, 92, 138, 0.4)",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.08)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.92)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        orbPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.04)", opacity: "1" },
        },
        rotateHighlight: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        blob: "blob 25s infinite ease-in-out",
        "blob-slow": "blob 30s infinite ease-in-out reverse",
        float: "float 6s ease-in-out infinite",
        "orb-pulse": "orbPulse 4s ease-in-out infinite",
        "rotate-slow": "rotateHighlight 12s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
