/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eef2f9',
          100: '#d5dff0',
          200: '#adc0e2',
          300: '#7b9acf',
          400: '#4f78bc',
          500: '#2d5fa8',
          600: '#1e4a8f',
          700: '#163870',
          800: '#0f2750',
          900: '#091830',
          950: '#050e1c',
        },
        gold: {
          50:  '#fdfbf0',
          100: '#faf4d3',
          200: '#f4e89a',
          300: '#edd65b',
          400: '#e4c22a',
          500: '#c9a81a',
          600: '#a68712',
          700: '#82680d',
          800: '#5e4b0a',
          900: '#3b2f07',
        },
        cream: {
          50:  '#fdfcf9',
          100: '#faf7f0',
          200: '#f3ede0',
          300: '#e8dfcc',
          400: '#d8ccb4',
          500: '#c4b49a',
        },
        stone: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      fontFamily: {
        serif:  ['Playfair Display', 'Georgia', 'serif'],
        sans:   ['Inter', 'system-ui', 'sans-serif'],
        body:   ['Lora', 'Georgia', 'serif'],
      },
      boxShadow: {
        'card':   '0 4px 24px 0 rgba(9,24,48,0.08)',
        'card-lg':'0 16px 48px 0 rgba(9,24,48,0.14)',
        'glow':   '0 0 40px 0 rgba(30,74,143,0.18)',
      },
      backgroundImage: {
        'hero-grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
