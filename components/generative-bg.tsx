'use client'

import { generateInitialBlockStyles } from '@/lib/blockUtils'
import { generateRandomBlockStyle } from '@/lib/blockUtils'
import { regenerateBlocks } from '@/lib/blockUtils'
import { defaultConfig } from '@/lib/config'
import { adjectives, defaultIntro } from '@/lib/constants'
import { createClearableInterval, getRandomAdjective, getRandomSymbolicObject } from '@/lib/helpers'
import { Box, styled } from '@/styled-system/jsx'
import { token } from '@/styled-system/tokens'
import { Token } from '@/styled-system/tokens'
import { BlockStyle } from '@/types'
import { useEffect, useState } from 'react'
import { useCallback } from 'react'
import { useRef } from 'react'
import { unstable_ViewTransition as ViewTransition } from 'react'
import { FeatureBlock } from './feature-block'
import LLMBlock from './llm-block'
import { RandomGeometry } from './random-geometry'

export function GenerativeBg() {
  const blockCount = defaultConfig.blocks.count

  const [isPaused, setIsPaused] = useState(defaultConfig.isPaused)
  const [blocksToRegenerate, setBlocksToRegenerate] = useState(new Set<number>())
  const [blockStyles, setBlockStyles] = useState<BlockStyle[]>([])
  const intervalRef = useRef<ReturnType<typeof createClearableInterval> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  const renderBlock = (i: number) => {
    const style = blockStyles[i]

    const styleObj = {
      backgroundColor: style.bg,
      top: style.top,
      left: style.left,
      zIndex: style.zIndex,
      width: `${style.width}vw`,
      fontFamily: token(`fonts.${style.fontFamily}` as Token),
      filter: `blur(${style.scale < 1 ? Math.floor((1 - style.scale) * 5) : 0}px)`,
      transform: `scale(${style.scale}) rotateX(${style.rotateX}deg) rotateY(${style.rotateY}deg) rotateZ(${style.rotateZ}deg)`,
    }

    return (
      <LLMBlock
        key={i}
        index={i}
        shouldRegenerate={blocksToRegenerate.has(i)}
        isPaused={isPaused}
        onRegenerationStart={() => onBlockRegenerationStart(i)}
        content={JSON.stringify(defaultIntro)}
        style={styleObj}
      />
    )
  }
  return (
    <Box position="relative" h="100%" overflow="hidden" bg="red.600">
      {blockStyles.length > 0 && Array.from({ length: blockCount }).map((_, i) => renderBlock(i))}

      <ViewTransition name="fblock">
        <FeatureBlock ref={containerRef} isPaused={isPaused} />
      </ViewTransition>

      <RandomGeometry isPaused={isPaused} />

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
