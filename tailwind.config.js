/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/features/arena/**/*.{ts,tsx}', './src/features/profile/**/*.{ts,tsx}'],
  // Scoped under #root so Tailwind's utility classes win over Chakra/Emotion's
  // late-injected CSS-in-JS without needing `!important` on every class.
  important: '#root',
  theme: {
    extend: {
      fontFamily: {
        // Mirrors the `orb`/`tlm` font keys in src/shared/styles/theme.ts (Chakra theme)
        orb: ['Orbitron', 'sans-serif'],
        tlm: ['Titillium Web', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
