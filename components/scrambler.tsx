'use client'

import { styled } from '@/styled-system/jsx'
import { useEffect, useState } from 'react'

const FONTS = ['monospace', 'serif', 'sans-serif']

interface ScramblerProps {
  children: string
}

export default function Scrambler({ children }: ScramblerProps) {
  const [fontIndices, setFontIndices] = useState<number[]>(
    Array.from({ length: children.length }, () => 0),
  )

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.7) {
        setFontIndices((prev) => {
          // Pick a random letter to change
          const idx = Math.floor(Math.random() * children.length)
          const newIndices = [...prev]
          newIndices[idx] = Math.floor(Math.random() * FONTS.length)
          return newIndices
        })
      }
    }, 100)
    return () => clearInterval(interval)
  }, [children.length])

  return (
    <span>
      {children.split('').map((char, i) => {
        return (
          <styled.span
            key={i}
            fontFamily="var(--f)"
            style={{ ['--f' as string]: FONTS[fontIndices[i]] }}
          >
            {char}
          </styled.span>
        )
      })}
    </span>
  )
}
