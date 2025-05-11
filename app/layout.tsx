import type { Metadata } from 'next'
import './globals.css'
import { css } from '@/styled-system/css'

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
    <html lang="en">
      <body className={css({ position: 'relative' })}>{children}</body>
    </html>
  )
}
