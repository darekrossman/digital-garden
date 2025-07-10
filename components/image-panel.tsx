'use client'

import { styled } from '@/styled-system/jsx'
import { Box } from '@/styled-system/jsx'
import { useGame } from './game-context'
import { Panel } from './ui/panel'
import { ImageFrame } from './image-frame'
import { useEffect, useState } from 'react'
import { VideoCanvas } from './video-canvas'

export const ImagePanel = () => {
  const { sceneDescription, isLoading, setSceneDescription, imagePrompt, setImagePrompt } =
    useGame()
  const [isImageRendered, setIsImageRendered] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setSceneDescription('')
      setImagePrompt('')
      setIsImageRendered(false)
    }
  }, [isLoading])

  return (
    <Panel w="full" minH="0" maxH="min-content">
      <Box overflow="hidden">
        <Box w="full" aspectRatio="1/1" maxH="100%">
          <ImageFrame
            prompt={imagePrompt}
            minPixelSize={4}
            onImageRendered={() => setIsImageRendered(true)}
          />
        </Box>
      </Box>

      <Box minH="133px" p="6" w="full" borderTop="1px solid {var(--primary)}" hideBelow="md">
        <styled.p fontSize="sm" fontStyle="italic" mt="-1px" lineClamp="4">
          {isImageRendered ? sceneDescription : '...'}
        </styled.p>
      </Box>
    </Panel>
  )
}
