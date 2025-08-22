/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A2647",
        light: "#F5F6FA",
        accent: "#F5B700",
        accentAlt: "#00A896",
      },
    },
  },
  plugins: [],
}
