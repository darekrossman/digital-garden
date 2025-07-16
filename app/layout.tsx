import { Box } from '@/styled-system/jsx'
import './globals.css'
import { css, cx } from '@/styled-system/css'
import type { Metadata } from 'next'
import { Silkscreen, Major_Mono_Display, VT323 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

const silkscreen = Silkscreen({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--fonts-pixel',
})

const majorMonoDisplay = Major_Mono_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--fonts-major-mono',
})

const rpgFont = VT323({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--fonts-rpg',
})

export const metadata: Metadata = {
  title: 'Personal Portfolio of Darek Rossman',
  description: 'What you see is what you get.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cx(silkscreen.variable, majorMonoDisplay.variable, rpgFont.variable)}
    >
      <body className={css({ position: 'relative' })}>
        <Box h="100dvh" position="relative" display="flex" flexDirection="column">
          {children}
        </Box>

        <Analytics />
      </body>
    </html>
  )
}
