/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx}", "./src/components/**/*.{js,jsx}", "./src/lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#0a0a0a",
        panel: "#121212",
        graphite: "#1b1b1b",
        neon: "#b6ff00",
        fog: "#d1d5db",
      },
      fontFamily: {
        sans: ["var(--font-manrope)"],
        display: ["var(--font-sora)"],
      },
      boxShadow: {
        halo: "0 0 0 1px rgba(182,255,0,0.08), 0 24px 90px rgba(0,0,0,0.45)",
        neon: "0 0 30px rgba(182,255,0,0.24)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.35", transform: "scaleX(0.96)" },
          "50%": { opacity: "1", transform: "scaleX(1)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseLine: "pulseLine 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
