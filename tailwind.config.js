/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    `./src/pages/**/*.{js,jsx,ts,tsx}`,
    `./src/components/**/*.{js,jsx,ts,tsx}`,
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['"Roboto Mono"', 'monospace'],
      },
      animation: {
        'flash': 'flash 1s ease-in-out infinite',
        'draw-circle': 'draw-circle 2s ease-in-out infinite',
      },
      keyframes: {
        flash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'draw-circle': {
          '0%': { strokeDasharray: '0 69', strokeDashoffset: '0' },
          '100%': { strokeDasharray: '69 69', strokeDashoffset: '0' },
        }
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
