/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0059b3",
        lightBlue: "#e0f0ff",
        cardBlue: "#b3d9ff",
        borderBlue: "#80bfff",
        textBlue: "#003366",
      },
    },
  },
  plugins: [],
};