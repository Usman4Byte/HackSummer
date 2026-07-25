import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#211E19",
        muted: "#6B6455",
        cream: "#FDF6EF",
        cream2: "#F4F1EC",
        peach: "#FADFC9",
        peach2: "#F8D0B4",
        accent: "#EC7C43",
        accent2: "#E0912F",
        good: "#2FA36B",
        goodBg: "#E4F4EC",
        goodText: "#1f7a4e",
        warn: "#E0912F",
        warnBg: "#FBEFD9",
        warnText: "#8a5a12",
        bad: "#D4503A",
        badBg: "#FBE6E1",
        badText: "#a03a29",
        darkCard: "#1C1A17",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(120,90,60,0.10)",
        glassSm: "0 4px 14px rgba(120,90,60,0.08)",
        sendOrange: "0 4px 14px rgba(236,124,67,0.30)",
      },
      borderRadius: {
        glass: "20px",
      },
      keyframes: {
        sentinelFadeIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "none" },
        },
        sentinelPulseRed: {
          "0%": { boxShadow: "0 0 0 0 rgba(212,80,58,0.55)" },
          "100%": { boxShadow: "0 0 0 14px rgba(212,80,58,0)" },
        },
        sentinelBlink: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        sentinelFadeIn: "sentinelFadeIn 260ms ease-out forwards",
        sentinelPulseRed: "sentinelPulseRed 900ms ease-out 1",
        sentinelBlink: "sentinelBlink 1.1s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
