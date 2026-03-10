import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./three/**/*.{ts,tsx}",
    "./shaders/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A0D12",
        mist: "#DDE5F0",
        accent: "#8CC8FF",
        sand: "#E9DCC6",
        cyan: "#6ED3FF"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"]
      },
      boxShadow: {
        aura: "0 32px 90px rgba(140, 200, 255, 0.24)"
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)"
      },
      animation: {
        drift: "drift 14s ease-in-out infinite",
        pulseLine: "pulseLine 3.6s ease-in-out infinite"
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
          "50%": { transform: "translate3d(0, -12px, 0) rotate(1deg)" }
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.25", transform: "scaleX(0.8)" },
          "50%": { opacity: "1", transform: "scaleX(1)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
