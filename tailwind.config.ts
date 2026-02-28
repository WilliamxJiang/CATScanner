import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cat: {
          yellow: "#FFCD11",
          yellowDark: "#D4A800",
          black: "#000000",
          bg: "#0B0C10"
        },
        pass: { DEFAULT: "#16a34a" },
        monitor: { DEFAULT: "#eab308" },
        fail: { DEFAULT: "#dc2626" }
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      }
    }
  },
  plugins: []
};

export default config;

