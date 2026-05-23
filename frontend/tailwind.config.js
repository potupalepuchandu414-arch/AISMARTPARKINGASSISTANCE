/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        park: {
          950: "#0a0f14",
          900: "#0f172a",
          accent: "#14b8a6",
          accentdim: "#0d9488",
        },
      },
    },
  },
  plugins: [],
};
