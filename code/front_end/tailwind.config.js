/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        text: "#0f0a06c3",
        background: "#f6e8da",
        // primary: "#b68863",
        primary: "#B07444",
        secondary: "#f0dab7",
        accent: "#f8983f",
      },
      fontFamily: {
        'poppins': ['Poppins'],
     }
    },
  },
  plugins: [],
}

