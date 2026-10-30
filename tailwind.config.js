/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        navy: "var(--navy)",
        "navy-deep": "var(--navy-deep)",
        "navy-soft": "var(--navy-soft)",
        gold: "var(--gold)",
        "gold-light": "var(--gold-light)",
        "gold-deep": "var(--gold-deep)",
        ivory: "var(--ivory)",
        "ivory-soft": "var(--ivory-soft)",
        "ivory-card": "var(--ivory-card)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        "line-light": "var(--line-light)",
        "line-dark": "var(--line-dark)",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-inter)", "Arial", "sans-serif"],
      },
      maxWidth: { shell: "1440px" },
      borderRadius: { hairline: "2px" },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
};
