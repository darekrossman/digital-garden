import './globals.css'
import { css } from '@/styled-system/css'
import type { Metadata } from 'next'
import { Silkscreen as PixelFont } from 'next/font/google'

const pfont = PixelFont({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--fonts-pixel',
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
    <html lang="en" className={pfont.variable}>
      <body className={css({ position: 'relative' })}>{children}</body>
    </html>
  )
}
