/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vf: {
          bg: '#FBF9F5',
          surface: '#FFFFFF',
          dark: '#0E0E12',
          darkSurface: '#16161C',
          darkElevated: '#1E1E26',
          darkBorder: '#2A2A36',
          text: '#151515',
          muted: '#6F6B63',
          border: '#E5E2DA',
          accent: {
            DEFAULT: '#EA580C', // Saffron / Amber primary
            hover: '#C2410C',
            light: '#FFF7ED',
            dark: '#7C2D12',
            glow: 'rgba(234, 88, 12, 0.25)',
          },
          amber: {
            DEFAULT: '#D97706',
            light: '#FEF3C7',
          }
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave-flow': 'waveFlow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        waveFlow: {
          '0%': { transform: 'scaleY(0.4)' },
          '100%': { transform: 'scaleY(1.0)' },
        }
      }
    },
  },
  plugins: [],
}
