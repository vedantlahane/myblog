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
        "brand-navy": "#10162F",
        "brand-blue": "#20409A",
        "ui-background": "#F7F8FA",
        "ui-surface": "#FFFFFF",
        "ui-border": "#E6E6E6",
        "text-primary": "#1C1D1F",
        "text-secondary": "#636466",
        "feedback-green": "#04A85B",
        "feedback-red": "#D43D2A",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Source Code Pro", "Menlo", "monospace"],
      },
      fontSize: {
        h1: ["2.5rem", { lineHeight: "1.2", fontWeight: "800" }],
        h2: ["2rem", { lineHeight: "1.2", fontWeight: "700" }],
        h3: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(15, 23, 42, 0.1)",
        "card-hover": "0 10px 25px -3px rgba(15, 23, 42, 0.18)",
      },
      borderRadius: {
        card: "12px",
        pill: "999px",
      },
      transitionProperty: {
        spacing: "margin, padding",
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
  ],
}
