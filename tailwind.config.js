/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF9F5', // Warm alabaster/linen background
        card: '#FFFFFF',   // Pure white elements
        ink: '#1C221E',    // Deep forest pine/obsidian charcoal text
        brand: {
          DEFAULT: '#566E5D', // Elegant sage green
          dark: '#3D5043',    // Deep pine forest
          light: '#EFF3F0',   // Sage mist
        },
        accent: '#D4A373', // Warm oak/sand highlight
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
