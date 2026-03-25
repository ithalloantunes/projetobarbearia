/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-bg) / <alpha-value>)",
        "background-elevated": "rgb(var(--color-bg-elevated) / <alpha-value>)",
        "background-muted": "rgb(var(--color-bg-muted) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-soft": "rgb(var(--color-surface-soft) / <alpha-value>)",
        "surface-strong": "rgb(var(--color-surface-strong) / <alpha-value>)",
        foreground: "rgb(var(--color-fg) / <alpha-value>)",
        "foreground-muted": "rgb(var(--color-fg-muted) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-container": "rgb(var(--color-primary-container) / <alpha-value>)",
        outline: "rgb(var(--color-outline) / <alpha-value>)",
        "outline-variant": "rgb(var(--color-outline-variant) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
        "error-container": "rgb(var(--color-error-container) / <alpha-value>)",
        "background-light": "#f7f4ee",
        "background-dark": "#15120d"
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["'Manrope'", "system-ui", "sans-serif"],
        ui: ["'IBM Plex Sans'", "system-ui", "sans-serif"]
      },
      borderRadius: {
        sm: "0.4rem",
        DEFAULT: "0.55rem",
        md: "0.65rem",
        lg: "0.85rem",
        xl: "1rem",
        full: "9999px"
      },
      boxShadow: {
        atelier: "0 10px 30px rgba(0, 0, 0, 0.22)",
        float: "0 24px 60px rgba(16, 12, 8, 0.46)",
        line: "inset 0 1px 0 rgba(255, 255, 255, 0.06)"
      },
      backgroundImage: {
        "atelier-gradient":
          "linear-gradient(120deg, rgba(185,150,84,1) 0%, rgba(229,205,149,1) 45%, rgba(167,126,66,1) 100%)",
        "atelier-radial":
          "radial-gradient(circle at 20% 15%, rgba(192,154,88,0.17), rgba(21,18,13,0) 42%)"
      },
      letterSpacing: {
        editorial: "0.14em"
      }
    }
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")]
};
