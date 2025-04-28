/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/*.{html,js}", "./server/views/**/*.ejs"],
  theme: {
    extend: {
		keyframes: {
			'slide-in': {
			  '0%': { transform: 'translateX(100%)', opacity: '0' },
			  '100%': { transform: 'translateX(0)', opacity: '1' },
			},
		  },
		  animation: {
			'slide-in': 'slide-in 0.3s ease-out forwards',
		  },
		colors: {
			'cgya-cyan': 'var(--color-cgya-cyan)',
			'cgya-pink': 'var(--color-cgya-pink)'
     	 }
    },
  },
  plugins: [],
}
