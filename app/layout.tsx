import { Box } from '@/styled-system/jsx'
import './globals.css'
import { css, cx } from '@/styled-system/css'
import type { Metadata } from 'next'
import { Silkscreen } from 'next/font/google'
import { Major_Mono_Display } from 'next/font/google'

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
    <html lang="en" className={cx(silkscreen.variable, majorMonoDisplay.variable)}>
      <body className={css({ position: 'relative' })}>
        <Box h="100dvh" position="relative" display="flex" flexDirection="column">
          {children}
        </Box>
      </body>
    </html>
  )
}
