/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Brand palette (from design spec)
        primary: "#007bff",
        secondary: "#FFFFFF",
        dark: "#171B23",
        darkFilterbar: "#1F1F1F",
        darkBorder: "#616161",
        grayLight: "#353535",
        formHeading: "#3F414D",
        neutral: "#C5C6C7", // renamed from gray - used for neutral elements
        neutralLight: "#EDEDED", // renamed from grayLight - used for light neutral backgrounds
        background: "#FAF8FF",
        background2: "#FAF8FF",
        border: "#D8D9D9",
        border2: "#D0D5DD",
        primaryHover: "#1a88ff",
        required: "#f54438",
        // Text colors
        textMain: "#31394D",
        textSmall: "#828A90",
        textMain2: "#FAFAFA",
        textMain3: "#232D42",
        // State colors
        success: "#199226",
        warning: "#F9AA00",
        danger: "#F4462C",
        info: "#3B82F6",
        pending: "#F59E0B",

        // Card backgrounds - renamed for clarity
        cardbg: {
          info: "#EEF4FF", // renamed from blue - used for info/analytics cards
          success: "#F2FFFC", // renamed from green - used for success/positive cards
          warning: "#FFF8ED", // renamed from orange - used for warning/alert cards
          error: "#FFF5F5", // renamed from pink - used for error/danger cards
          accent: "#FCF4FF", // renamed from purple - used for accent/highlight cards
        },
        // Primary variants (light tints)
        primaryV: {
          100: "#e6f2ff",
          200: "#b3d7ff",
          300: "#80bdff",
          400: "#acb5f5",
        },
        secondaryV: {
          100: "#f7ffe4",
          200: "#f3ffd7",
          300: "#efffc9",
          400: "#ebffbc",
          500: "#e2ffa1",
          600: "#daff86",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in",
        "slide-up": "slideUp 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        "fade-out": "fadeOut 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        typewriter: "typewriter 4s steps(40, end) forwards",
        blink: "blink 750ms step-end infinite",
      },
      keyframes: {
        typewriter: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        blink: {
          "0%, 100%": { "border-color": "transparent" },
          "50%": { "border-color": "#007bff" },
        },
        fadeIn: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        fadeOut: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { transform: "translateY(60px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
      fontFamily: {
        interTight: ["var(--font-inter-tight)", "ui-sans-serif", "system-ui"],
        poppins: ["var(--font-poppins)", "ui-sans-serif", "system-ui"],
        caveat: ["var(--font-caveat)", "cursive"],
        dmsans: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
