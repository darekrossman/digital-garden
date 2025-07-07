'use client'

import { styled } from '@/styled-system/jsx'
import { Box } from '@/styled-system/jsx'
import { useGame } from './game-context'
import { Panel } from './ui/panel'
import { ImageFrame } from './image-frame'
import { useEffect, useState } from 'react'

export const ImagePanel = () => {
  const { sceneDescription, isLoading, setSceneDescription } = useGame()
  const [isImageRendered, setIsImageRendered] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setSceneDescription('')
      setIsImageRendered(false)
    }
  }, [isLoading])

  return (
    <Panel w="full" minH="0" maxH="min-content">
      <Box overflow="hidden">
        <Box w="full" aspectRatio="1/1" maxH="100%">
          <ImageFrame prompt={sceneDescription} onImageRendered={() => setIsImageRendered(true)} />
        </Box>
      </Box>

      <Box h="154px" p="8" w="full" borderTop="1px solid {var(--primary)}" hideBelow="md">
        <styled.p fontSize="14px" fontStyle="italic" lineClamp="5">
          {isImageRendered ? sceneDescription : '...'}
        </styled.p>
      </Box>
    </Panel>
  )
}
