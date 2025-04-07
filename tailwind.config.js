/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/*.{html,js}", "./server/views/**/*.ejs"],
  theme: {
    extend: {
      colors: {
        'cgya-cyan': 'var(--color-cgya-cyan)',
        'cgya-pink': 'var(--color-cgya-pink)'
      }
    },
  },
  plugins: [],
}
