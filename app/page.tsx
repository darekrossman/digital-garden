'use client'

import WireframeCube from '@/components/cube'
import { FeatureBlock } from '@/components/feature-block'
import LLMBlock from '@/components/llm-block'
import { RandomGeometry } from '@/components/random-geometry'
import Scrambler from '@/components/scrambler'
import WireframeSphere from '@/components/sphere'
import {
  generateInitialBlockStyles,
  generateRandomBlockStyle,
  regenerateBlocks,
} from '@/lib/blockUtils'
import { defaultConfig } from '@/lib/config'
import { defaultIntro } from '@/lib/constants'
import { generateRandomWireframeStyle, getWireframePositionStyle } from '@/lib/geometry-utils'
import { createClearableInterval } from '@/lib/helpers'
import { Box, Center, Stack, styled } from '@/styled-system/jsx'
import { Token, token } from '@/styled-system/tokens'
import { BlockStyle, WireframeStyle } from '@/types'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Main page component
 */
export default function Home() {
  const blockCount = defaultConfig.blocks.count
  const containerRef = useRef<HTMLDivElement>(null)
  const [blocksToRegenerate, setBlocksToRegenerate] = useState(new Set<number>())
  const [blockStyles, setBlockStyles] = useState<BlockStyle[]>([])
  const [isPaused, setIsPaused] = useState(defaultConfig.isPaused)

  // Interval reference for regeneration timing
  const intervalRef = useRef<ReturnType<typeof createClearableInterval> | null>(null)

  // Callback for when a block starts regeneration
  const onBlockRegenerationStart = useCallback((blockIndex: number) => {
    setBlocksToRegenerate((current) => {
      const newSet = new Set(current)
      newSet.delete(blockIndex)
      return newSet
    })

    setBlockStyles((currentStyles) => {
      const updatedStyles = [...currentStyles]
      updatedStyles[blockIndex] = generateRandomBlockStyle()
      return updatedStyles
    })
  }, [])

  // Generate random positions and scales for blocks on mount
  useEffect(() => {
    const styles = generateInitialBlockStyles(blockCount, () => generateRandomBlockStyle())
    setBlockStyles(styles)
  }, [blockCount])

  // Handle pause state changes
  useEffect(() => {
    if (isPaused) {
      setBlocksToRegenerate(new Set<number>())
      // The interval will be cleared in the main interval effect
    }
  }, [isPaused])

  // Manage regeneration interval
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        intervalRef.current.clear()
        intervalRef.current = null
      }
      return
    }

    // If not paused, (re)set up the interval
    if (intervalRef.current) {
      intervalRef.current.clear()
    }

    intervalRef.current = createClearableInterval(() => {
      const count = Math.min(defaultConfig.blocks.regenerateCount, blockCount)
      setBlocksToRegenerate((current) => regenerateBlocks(current, count, blockCount))
    }, defaultConfig.regenerateInterval)

    return () => {
      if (intervalRef.current) {
        intervalRef.current.clear()
        intervalRef.current = null
      }
    }
  }, [isPaused, blockCount])

  // Helper to render a single block with its position index
  const renderBlock = (i: number) => {
    const style = blockStyles[i] || {
      top: '0%',
      left: '0%',
      scale: 1,
      zIndex: 0,
      rotateZ: 0,
      width: '30vw',
      bg: 'transparent',
    }

    const filter = `blur(${style.scale < 1 ? Math.floor((1 - style.scale) * 5) : 0}px)`

    return (
      <LLMBlock
        key={i}
        index={i}
        containerRef={containerRef}
        shouldRegenerate={blocksToRegenerate.has(i)}
        isPaused={isPaused}
        onRegenerationStart={() => onBlockRegenerationStart(i)}
        content={JSON.stringify(defaultIntro)}
        style={{
          backgroundColor: style.bg,
          top: style.top,
          left: style.left,
          zIndex: style.zIndex,
          width: `${style.width}vw`,
          fontFamily: token(`fonts.${style.fontFamily}` as Token),
          filter,
          transform: `scale(${style.scale}) rotateX(${style.rotateX}deg) rotateY(${style.rotateY}deg) rotateZ(${style.rotateZ}deg)`,
        }}
      />
    )
  }

  return (
    <Box h="100dvh" position="relative" display="flex" flexDirection="column">
      {/* Positioned blocks */}
      <Box position="relative" h="100%" overflow="hidden">
        {/* {blockStyles.length > 0 && Array.from({ length: blockCount }).map((_, i) => renderBlock(i))} */}

        <FeatureBlock ref={containerRef} isPaused={isPaused} />

        <RandomGeometry isPaused={isPaused} />
      </Box>

      <Box pos="fixed" bottom="0" right="0" zIndex="99999">
        <styled.button
          bg="black"
          color="white"
          py="1"
          px="2"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? 'resume' : 'pause'}
        </styled.button>
      </Box>
    </Box>
  )
}
