import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      keyframes: {
        'cursor-blink': {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
      },
      tokens: {
        fonts: {
          mono: {
            value: 'monospace',
          },
          majorMono: {
            value: 'var(--fonts-major-mono)',
          },
          pixel: {
            value: 'var(--fonts-pixel)',
          },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: 'styled-system',

  // JSX config
  jsxFramework: 'react',
})
