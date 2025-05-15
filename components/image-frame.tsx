'use client'

import { Box } from '@/styled-system/jsx'
import { useEffect, useState } from 'react'
import { generate } from './inference/image-gen'

export function ImageFrame() {
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>()

  useEffect(() => {
    generate('Astronaut riding a horse').then((url) => setImageDataUrl(url))
  }, [])

  return (
    <Box position="absolute" top="0" left="0" right="0" bottom="0" zIndex="0">
      <img src={imageDataUrl} alt="Generated" />
    </Box>
  )
}
