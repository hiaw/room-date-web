/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  // Mobile-first breakpoints
  theme: {
    screens: {
      sm: "640px", // Small devices
      md: "768px", // Tablets
      lg: "1024px", // Desktop
      xl: "1280px", // Large desktop
      "2xl": "1536px", // Extra large

      // Mobile-specific breakpoints
      xs: "375px", // Small phones
      "mobile-lg": "414px", // Large phones
    },

    extend: {
      // Mobile-friendly spacing
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },

      // Mobile-friendly typography
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
      },

      // Room Dates brand colors
      colors: {
        // Primary brand colors
        primary: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444", // Main primary
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },

        // Secondary/accent colors
        accent: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9", // Main accent
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },

        // Neutral grays for mobile interfaces
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },

        // Status colors
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },

      // Mobile-optimized shadows
      boxShadow: {
        mobile:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "mobile-lg":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "mobile-xl":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },

      // Animation for mobile interactions
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "bounce-gentle": "bounceGentle 0.6s ease-out",
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },

      // Mobile-friendly border radius
      borderRadius: {
        mobile: "0.5rem",
        "mobile-lg": "0.75rem",
      },

      // Touch-friendly sizing
      minHeight: {
        touch: "44px", // Minimum touch target size
        "screen-mobile":
          "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
      },

      minWidth: {
        touch: "44px", // Minimum touch target size
      },
    },
  },

  plugins: [
    // Add custom utilities for mobile
    function ({ addUtilities }) {
      const newUtilities = {
        // Safe area utilities
        ".pt-safe": {
          paddingTop: "env(safe-area-inset-top)",
        },
        ".pb-safe": {
          paddingBottom: "env(safe-area-inset-bottom)",
        },
        ".pl-safe": {
          paddingLeft: "env(safe-area-inset-left)",
        },
        ".pr-safe": {
          paddingRight: "env(safe-area-inset-right)",
        },

        // Touch-friendly utilities
        ".touch-target": {
          minHeight: "44px",
          minWidth: "44px",
          padding: "12px",
        },

        // Mobile scrolling
        ".scroll-smooth-mobile": {
          scrollBehavior: "smooth",
          "-webkit-overflow-scrolling": "touch",
        },

        // Prevent zoom on mobile inputs
        ".no-zoom": {
          fontSize: "16px",
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
