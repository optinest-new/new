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
        page: "var(--page)",
        ink: "var(--ink)",
        mist: "var(--page-elevated)",
        fog: "#2a2a2a",
        surface: "var(--page)",
        "surface-dim": "var(--surface-dim)",
        "surface-low": "var(--surface-low)",
        "surface-container": "var(--page-panel)",
        "surface-container-high": "#2a2a2a",
        "surface-container-highest": "#353535",
        "surface-base": "#f5f6ef",
        primary: "#fcbb3b",
        "primary-container": "#c98f00",
        "growth-orange": "#c98f00",
        tertiary: "#cec7a1",
        coral: "#ff6b6b",
        line: "rgba(var(--line), <alpha-value>)",
        pop: {
          yellow: "#fcbb3b",
          red: "#ff6b6b",
          blue: "#f5f6ef"
        },
        amber: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03"
        },
        alert: {
          red: "#d88",
          redBg: "#fff1f1",
          redText: "#7a1f1f",
          green: "#84b98d",
          greenBg: "#e9f9ec",
          greenText: "#1f5c28",
          blue: "#9db6e7",
          blueBg: "#edf4ff",
          blueText: "#1d4ea5",
          amber: "#e3b36d",
          amberBg: "#fff8ec",
          amberText: "#8a5a00"
        },
        status: {
          blue: "#d8ecff",
          blueText: "#134d7a",
          green: "#d5f4e2",
          greenText: "#0b6a40",
          amber: "#fff1c5",
          amberText: "#8a5a00",
          purple: "#e9dbff",
          purpleText: "#4f2b88",
          gray: "#ececec",
          grayText: "#5f5f5f",
          mist: "#ffe2e2",
          mistText: "#892727"
        },
        tier: {
          red: { border: "#b42318/25", bg: "#fff4f2", badge: "#f04438", text: "#7a271a", iconWrap: "border-[#f04438]/40 bg-[#ffe4e1] text-[#b42318]" },
          blue: { border: "#175cd3/25", bg: "#eff8ff", badge: "#175cd3", text: "#1849a9", iconWrap: "border-[#175cd3]/40 bg-[#dbeafe] text-[#175cd3]" },
          teal: { border: "#0e9384/25", bg: "#ecfdf3", badge: "#0e9384", text: "#0f766e", iconWrap: "border-[#0e9384]/35 bg-[#ccfbf1] text-[#0f766e]" },
          green: { border: "#12b76a/25", bg: "#edfcf2", badge: "#12b76a", text: "#027a48", iconWrap: "border-[#12b76a]/35 bg-[#dcfce7] text-[#027a48]" },
          amber: { border: "#c58a00/30", bg: "#fff7e0", badge: "#b17a00", text: "#6a4700", iconWrap: "border-[#b17a00]/35 bg-[#fef3c7] text-[#7a5200]" }
        }
      },
      boxShadow: {
        hard: "6px 6px 0 #fcbb3b",
        "hard-lg": "10px 10px 0 #fcbb3b"
      },
      fontFamily: {
        display: ["var(--font-display)", "Space Grotesk", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "\"Liberation Mono\"", "\"Courier New\"", "monospace"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        pill: "999px"
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" }
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.15s ease-out",
        "fade-up": "fade-up 0.5s ease-out forwards",
        "slide-in-right": "slide-in-right 0.25s ease-out"
      }
    }
  },
  plugins: []
};

export default config;
