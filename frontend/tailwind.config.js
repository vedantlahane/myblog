module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: ["class", "[data-theme='dark']"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        // backward-compatible token used across templates
        "brand-blue": "#7952F3",
        "brand-blue-hover": "#5D2EE6",
        "brand-navy": "#0B0C10",        // deep space black
        "brand-iron": "#1B1E24",        // iron gray
        "brand-surface": "#262A32",    // soft surface gray
  "brand-accent-violet": "#7952F3", // cosmic violet (primary)
        "brand-accent-violet-hover": "#5D2EE6",
        "brand-accent-gold": "#D4A761", // imperial gold (secondary)
        "brand-cyan": "#66FCF1",
        "brand-red": "#C3073F",
        "surface": "#FFFFFF",
        "surface-muted": "#F6F8FB",
        "surface-elevated": "#FFFFFF",
        "surface-dark": "#10131A",
        "surface-darkest": "#07090F",
        "text-primary": "#101828",
        "text-secondary": "#5F6C7B",
        "text-subtle": "#738094",
        "border-default": "#E4E7EC",
        "border-dark": "rgba(255, 255, 255, 0.08)",
        "feedback-success": "#04A85B",
        "feedback-error": "#D43D2A",
        "ui-background": "var(--ui-background)",
        "ui-surface": "var(--ui-surface)",
        "ui-border": "var(--ui-border)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
        mono: ["Source Code Pro", "Menlo", "monospace"],
      },
      fontSize: {
        h1: ["3rem", { lineHeight: "1.15", fontWeight: "800" }],
        h2: ["2rem", { lineHeight: "1.2", fontWeight: "700" }],
        h3: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
      },
      boxShadow: {
        card: "0 8px 20px rgba(5, 6, 10, 0.6)",
        "card-hover": "0 18px 40px rgba(86, 52, 195, 0.18)",
        elevated: "0 24px 48px rgba(2, 6, 23, 0.75)",
      },
      borderRadius: {
        card: "12px",
        pill: "999px",
      },
      transitionTimingFunction: {
        suave: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        gentle: "180ms",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "0.8" },
          "50%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-soft": "pulseSoft 1.8s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s ease forwards",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
  ],
}
