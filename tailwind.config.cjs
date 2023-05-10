/** @type {import('tailwindcss').Config} */
import('tailwindcss')
const colors = require("tailwindcss/colors");

const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: "rgb(255, 247, 145)",
        black: colors.black,
        white: colors.white,
        shade: "rgba(0, 0, 0, 0.45)",
        bgshade: "rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@headlessui/tailwindcss'), require("daisyui"), require("tailwindcss-animate")],
  daisyui: {
    styled: true,
    themes: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "light",
  },
}

module.exports = config
