/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — Lucy in Stitches (from logo)
        'slate-blue': {
          DEFAULT: '#6B7FA3', // primary — fabric background
          light: '#8B9CBA',
          dark: '#54678A',
        },
        cream: {
          DEFAULT: '#F5F0E8', // secondary — stitched lettering
          dark: '#EAE2D3',
        },
        mauve: {
          DEFAULT: '#C4929A', // accent — logo background blur
          light: '#D6AEB4',
          dark: '#A9757D',
        },
        sage: {
          DEFAULT: '#9AB5A0', // supporting accent
          light: '#B4CCB9',
          dark: '#7E9B85',
        },
        charcoal: {
          DEFAULT: '#2C2C2C', // text — never pure black
          light: '#4A4A4A',
        },
      },
      fontFamily: {
        // Display / headings — handwritten, boutique feel
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        // Body — warm humanist serif
        body: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        // UI / data tables — clean, readable
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        warm: '0 4px 20px -4px rgba(107, 127, 163, 0.25)',
        'warm-lg': '0 10px 40px -8px rgba(107, 127, 163, 0.3)',
      },
    },
  },
  plugins: [],
};
