import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ornixBlack: "#0F0F0F",
        ornixGold: "#C9A74E"
      },
      fontFamily: {
        heading: ["Georgia", "Times New Roman", "serif"],
        body: ["Inter", "Arial", "sans-serif"]
      },
      boxShadow: {
        gold: "0 0 30px rgba(201, 167, 78, 0.35)",
        soft: "0 20px 60px rgba(0,0,0,0.45)"
      }
    }
  },
  plugins: []
};

export default config;
