import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3A7AFE",
          dark: "#1D5FEA",
          light: "#6CA8FF",
          neon: "#00D4FF",
        },
        accent: {
          DEFAULT: "#31FF83",
          glow: "#7FFF9F",
        },
        background: {
          DEFAULT: "#0A0A0A",
          light: "#F7F7F8",
          card: "#111213",
          stadium: "#0A0A0A",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#B5B7BA",
        },
        danger: "#FF5C5C",
        success: "#31FF83",
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #3A7AFE 0%, #00D4FF 100%)",
        "gradient-accent": "linear-gradient(135deg, #31FF83 0%, #7FFF9F 100%)",
        "gradient-sports": "linear-gradient(135deg, rgba(58,122,254,0.1) 0%, rgba(0,212,255,0.1) 100%)",
      },
      boxShadow: {
        smooth: "0 4px 24px rgba(0,0,0,0.25)",
        glow: "0 0 16px rgba(58,122,254,0.5)",
        "glow-primary": "0 0 20px rgba(58,122,254,0.6), 0 0 40px rgba(58,122,254,0.3)",
        "glow-accent": "0 0 20px rgba(49,255,131,0.6), 0 0 40px rgba(49,255,131,0.3)",
        "glow-strong": "0 0 30px rgba(58,122,254,0.8), 0 0 60px rgba(58,122,254,0.4)",
        "inner-glow": "inset 0 0 20px rgba(58,122,254,0.2)",
        "card-depth": "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        "card-hover": "0 12px 48px rgba(58,122,254,0.3), 0 0 24px rgba(58,122,254,0.2)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "bounce-subtle": "bounceSubtle 0.6s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "neon-pulse": "neonPulse 2s ease-in-out infinite",
        "gradient-slide": "gradientSlide 3s ease-in-out infinite",
        "ripple": "ripple 0.6s ease-out",
        "tap-bounce": "tapBounce 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(58,122,254,0.4)" },
          "50%": { boxShadow: "0 0 30px rgba(58,122,254,0.8), 0 0 60px rgba(58,122,254,0.4)" },
        },
        neonPulse: {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.8", filter: "brightness(1.2)" },
        },
        gradientSlide: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "1" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        tapBounce: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.96)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;