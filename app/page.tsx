'use client'

import WireframeCube from '@/components/cube'
import LLMBlock from '@/components/llm-block'
import Scrambler from '@/components/scrambler'
import WireframeSphere from '@/components/sphere'
import {
  generateInitialBlockStyles,
  generateRandomBlockStyle,
  regenerateBlocks,
} from '@/lib/blockUtils'
import { DEFAULT_CONFIG } from '@/lib/config'
import { defaultIntro } from '@/lib/constants'
import { createClearableInterval } from '@/lib/helpers'
import { generateRandomWireframeStyle, getWireframePositionStyle } from '@/lib/wireframeUtils'
import { Box, Center, Stack, styled } from '@/styled-system/jsx'
import { Token, token } from '@/styled-system/tokens'
import { BlockStyle, WireframeStyle } from '@/types'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Main page component
 */
export default function Home() {
  const blockCount = DEFAULT_CONFIG.blocks.count
  const containerRef = useRef<HTMLDivElement>(null)
  const [blocksToRegenerate, setBlocksToRegenerate] = useState(new Set<number>())
  const [blockStyles, setBlockStyles] = useState<BlockStyle[]>([])
  const [isPaused, setIsPaused] = useState(DEFAULT_CONFIG.isPaused)

  // Interval reference for regeneration timing
  const intervalRef = useRef<ReturnType<typeof createClearableInterval> | null>(null)

  // State for wireframe positioning and properties - use default from config
  const [wireframeStyle, setWireframeStyle] = useState<WireframeStyle>({
    top: '0',
    left: '0',
    width: '50px',
    height: '50px',
    scale: 1,
    type: DEFAULT_CONFIG.wireframe.type,
    segments: DEFAULT_CONFIG.wireframe.segments,
    wireframeColor: DEFAULT_CONFIG.wireframe.wireframeColor,
  })

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
      const count = Math.min(DEFAULT_CONFIG.blocks.regenerateCount, blockCount)
      setBlocksToRegenerate((current) => regenerateBlocks(current, count, blockCount))
      setWireframeStyle(generateRandomWireframeStyle())
    }, DEFAULT_CONFIG.regenerateInterval)

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
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      width: 30,
      bg: 'transparent',
      fontFamily: 'sans-serif',
    }

    const filter = `blur(${style.scale < 1 ? Math.floor((1 - style.scale) * 5) : 0}px)`

    return (
      <LLMBlock
        key={i}
        index={i}
        containerRef={containerRef}
        shouldRegenerate={blocksToRegenerate.has(i)}
        glitchProbability={DEFAULT_CONFIG.blocks.glitchProbability}
        isGloballyPaused={isPaused}
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
    <>
      <Box h="100dvh" position="relative" display="flex" flexDirection="column">
        {/* Positioned blocks */}
        <Box position="relative" h="100%" overflow="hidden">
          {blockStyles.length > 0 &&
            Array.from({ length: blockCount }).map((_, i) => renderBlock(i))}

          {/* Center intro - fixed position */}
          <Box
            ref={containerRef}
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            width="375px"
            height="375px"
            overflow="scroll"
            zIndex="20"
          >
            <Center bg="black" color="white" h="full">
              <Stack w="70%" textWrap="balance">
                <styled.h1>{defaultIntro.heading}</styled.h1>
                {defaultIntro.paragraphs.map((paragraph, i) => (
                  <styled.p key={i}>
                    {paragraph}
                    <Scrambler>.</Scrambler>
                  </styled.p>
                ))}
              </Stack>
            </Center>

            <Center bg="red" color="white" h="full">
              <Stack w="70%" textWrap="balance">
                <styled.h1>{defaultIntro.heading}</styled.h1>
                {defaultIntro.paragraphs.map((paragraph, i) => (
                  <styled.p key={i}>
                    {paragraph}
                    <Scrambler>.</Scrambler>
                  </styled.p>
                ))}
              </Stack>
            </Center>
          </Box>

          {/* Render either cube or sphere based on wireframeStyle */}
          <Box position="absolute" style={getWireframePositionStyle(wireframeStyle)} zIndex="-1">
            {wireframeStyle.type === 'cube' ? (
              <WireframeCube
                wireframeColor={wireframeStyle.wireframeColor}
                glitchIntensity={DEFAULT_CONFIG.wireframe.glitchIntensity}
              />
            ) : wireframeStyle.type === 'sphere' ? (
              <WireframeSphere
                widthSegments={wireframeStyle.segments}
                heightSegments={wireframeStyle.segments}
                wireframeColor={wireframeStyle.wireframeColor}
                glitchIntensity={DEFAULT_CONFIG.wireframe.glitchIntensity}
              />
            ) : null}
          </Box>
        </Box>
      </Box>
    </>
  )
}
