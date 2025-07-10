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
          rpg: {
            value: 'var(--fonts-rpg)',
          },
        },
        spacing: {
          '0': { value: '0px' },
          '0.5': { value: '2px' },
          '1': { value: '4px' },
          '1.5': { value: '6px' },
          '2': { value: '8px' },
          '2.5': { value: '10px' },
          '3': { value: '12px' },
          '3.5': { value: '14px' },
          '4': { value: '16px' },
          '5': { value: '20px' },
          '6': { value: '24px' },
          '7': { value: '28px' },
          '8': { value: '32px' },
          '9': { value: '36px' },
          '10': { value: '40px' },
          '11': { value: '44px' },
          '12': { value: '48px' },
          '14': { value: '56px' },
          '16': { value: '64px' },
          '20': { value: '80px' },
          '24': { value: '96px' },
          '28': { value: '112px' },
          '32': { value: '128px' },
          '36': { value: '144px' },
          '40': { value: '160px' },
          '44': { value: '176px' },
          '48': { value: '192px' },
          '52': { value: '208px' },
          '56': { value: '224px' },
          '60': { value: '240px' },
          '64': { value: '256px' },
          '72': { value: '288px' },
          '80': { value: '320px' },
          '96': { value: '384px' },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: 'styled-system',

  // JSX config
  jsxFramework: 'react',
})
