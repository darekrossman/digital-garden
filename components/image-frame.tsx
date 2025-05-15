'use client'

import { Box } from '@/styled-system/jsx'
import { useEffect, useState } from 'react'
import { generate } from './inference/image-gen'

export function ImageFrame({ prompt }: { prompt?: string }) {
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>()

  useEffect(() => {
    if (prompt) {
      console.log('generating image')
      generate(prompt).then((url) => setImageDataUrl(url))
    }
  }, [prompt])

  if (!imageDataUrl) return null

  return (
    <Box position="absolute" top="0" left="0" right="0" bottom="0" zIndex="0">
      <img src={imageDataUrl} alt="Generated" style={{ width: '100%', height: '100%' }} />
    </Box>
  )
}
