import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1b1f1b",
        mist: "#f7f7f2",
        fog: "#e4e6dd"
      },
      boxShadow: {
        hard: "8px 8px 0 #111"
      }
    }
  },
  plugins: []
};

export default config;
