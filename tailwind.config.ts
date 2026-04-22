import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50:  "#f7f8fb",
          100: "#eef1f7",
          200: "#dde2ee",
          300: "#bcc5d8",
          400: "#8a96b1",
          500: "#5b6885",
          600: "#3f4a64",
          700: "#2c344a",
          800: "#1c2233",
          900: "#0e1220",
        },
        brand: {
          50:  "#eef3ff",
          100: "#dce6ff",
          200: "#b9cbff",
          300: "#8ea7ff",
          400: "#5e7fff",
          500: "#3a5bff",
          600: "#1f3ee0",
          700: "#1830ad",
          800: "#152a87",
          900: "#11206a",
        },
        accent: {
          mint:   "#c6f1d6",
          sky:    "#cfe5ff",
          peach:  "#ffd9c9",
          lilac:  "#dcd7ff",
          lemon:  "#fff1b8",
          rose:   "#ffd6e7",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Inter", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)",
        card: "0 4px 24px -6px rgba(16,24,40,.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
