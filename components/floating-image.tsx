'use client'

import { ImageFrame } from '@/components/image-frame'
import { getRandomInt } from '@/lib/helpers'
import { Box } from '@/styled-system/jsx'
import { unstable_ViewTransition as ViewTransition } from 'react'
import { useEffect, useState } from 'react'

export function FloatingImage({ prompt }: { prompt: string }) {
  const [genStyle, setGenStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    setGenStyle({
      top: `${getRandomInt(-5, 95)}vh`,
      left: `${getRandomInt(-5, 95)}vw`,
    })
  }, [])

  return (
    <Box
      mixBlendMode="multiply"
      position="absolute"
      style={{
        ...genStyle,
      }}
    >
      <ViewTransition name="fblock" enter="glitch-in" exit="glitch-out">
        <ImageFrame prompt={prompt} />
      </ViewTransition>
    </Box>
  )
}
