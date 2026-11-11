import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#080d18",
        panel: "#101827",
        line: "#223047",
        accent: "#8b9cff",
        mint: "#69e3bd"
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 50px rgba(139, 156, 255, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
