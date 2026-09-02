/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/features/arena/**/*.{ts,tsx}',
    './src/features/profile/**/*.{ts,tsx}',
    './src/features/inventory/**/*.{ts,tsx}',
  ],
  // Scoped under <body> (rather than #root) so Tailwind's utility classes win
  // over Chakra/Emotion's late-injected CSS-in-JS without needing `!important`
  // on every class. Using `body` instead of `#root` also covers content that
  // Headless UI (Dialog, Listbox, etc.) portals directly onto <body>, outside
  // of #root — scoping to #root left those portals fully unstyled.
  important: 'body',
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
