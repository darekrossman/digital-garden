'use client'

import ControlPanel from '@/components/ControlPanel'
import LLMBlock from '@/components/LLMBlock'
import WireframeCube from '@/components/WireframeCube'
import WireframeSphere from '@/components/WireframeSphere'
import Scrambler from '@/components/scrambler'
import { defaultIntro } from '@/lib/constants'
import { createClearableInterval, clearAllTimeouts } from '@/lib/helpers'
import { generateRandomBlockStyle, generateInitialBlockStyles, regenerateBlocks } from '@/lib/blockUtils'
import { generateRandomWireframeStyle, getWireframePositionStyle } from '@/lib/wireframeUtils'
import { BlockStyle, WireframeStyle } from '@/types'
import { Box, Center, Stack, styled } from '@/styled-system/jsx'
import { Token, token } from '@/styled-system/tokens'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Main page component
 */
export default function Home() {
  // There are blocks to position around the viewport
  const blockCount = 9
  
  // Track multiple blocks to regenerate with a Set of indices
  const [blocksToRegenerate, setBlocksToRegenerate] = useState(new Set<number>())
  
  // Store position and scale for each block
  const [blockStyles, setBlockStyles] = useState<BlockStyle[]>([])
  
  // Interval reference for regeneration timing
  const intervalRef = useRef<ReturnType<typeof createClearableInterval> | null>(null)
  
  // State for wireframe positioning and properties
  const [wireframeStyle, setWireframeStyle] = useState<WireframeStyle>({
    top: '0',
    left: '0',
    width: '50px',
    height: '50px',
    scale: 1,
    type: null,
    segments: 12,
    wireframeColor: 0x000000,
  })
  
  // State for glitch intensity
  const [glitchIntensity, setGlitchIntensity] = useState(0.5)
  
  // State for pause status
  const [isPaused, setIsPaused] = useState(false)
  
  // State for regeneration interval
  const [regenerationInterval, setRegenerationInterval] = useState(10000)
  
  // State for glitch probability
  const [glitchProbability, setGlitchProbability] = useState(0.05)
  
  // State for number of blocks to regenerate at once
  const [regenerateCount, setRegenerateCount] = useState(2)

  // Generate random positions and scales for blocks on mount
  useEffect(() => {
    const styles = generateInitialBlockStyles(
      blockCount, 
      () => generateRandomBlockStyle({})
    )
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
      const count = Math.min(regenerateCount, blockCount)
      setBlocksToRegenerate(current => regenerateBlocks(current, count, blockCount))
      setWireframeStyle(generateRandomWireframeStyle())
    }, regenerationInterval)

    return () => {
      if (intervalRef.current) {
        intervalRef.current.clear()
        intervalRef.current = null
      }
    }
  }, [isPaused, regenerationInterval, regenerateCount, blockCount])

  // Handle manual regeneration of all blocks
  const regenerateAllBlocks = useCallback(() => {
    // Add all block indices to the regeneration set
    const allBlocks = new Set<number>()
    for (let i = 0; i < blockCount; i++) {
      allBlocks.add(i)
    }
    setBlocksToRegenerate(allBlocks)

    // Also randomize wireframe when manually regenerating
    setWireframeStyle(generateRandomWireframeStyle())
  }, [blockCount])

  // Callback for when a block starts regeneration
  const onBlockRegenerationStart = useCallback((blockIndex: number) => {
    setBlocksToRegenerate(current => {
      const newSet = new Set(current)
      newSet.delete(blockIndex)
      return newSet
    })
    
    setBlockStyles(currentStyles => {
      const updatedStyles = [...currentStyles]
      updatedStyles[blockIndex] = generateRandomBlockStyle({})
      return updatedStyles
    })
  }, [])

  // Regenerate all block positions but not content
  const regenerateAllPositions = useCallback(() => {
    setBlockStyles(current => current.map(() => generateRandomBlockStyle({})))
  }, [])

  // Handler for wireframe type changes
  const handleWireframeTypeChange = useCallback((type: 'cube' | 'sphere' | null) => {
    setWireframeStyle(current => ({ ...current, type }))
  }, [])

  // Handler for wireframe color changes
  const handleWireframeColorChange = useCallback((color: number) => {
    setWireframeStyle(current => ({ ...current, wireframeColor: color }))
  }, [])

  // Handler for wireframe segments changes
  const handleWireframeSegmentsChange = useCallback((segments: number) => {
    setWireframeStyle(current => ({ ...current, segments }))
  }, [])

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
      fontFamily: 'sans-serif'
    }

    return (
      <LLMBlock
        key={i}
        index={i}
        shouldRegenerate={blocksToRegenerate.has(i)}
        glitchProbability={glitchProbability}
        isGloballyPaused={isPaused}
        onRegenerationStart={() => onBlockRegenerationStart(i)}
        content={JSON.stringify(defaultIntro)}
        style={{
          backgroundColor: style.bg,
          position: 'absolute',
          top: style.top,
          left: style.left,
          zIndex: style.zIndex,
          width: `${style.width}vw`,
          fontFamily: token(`fonts.${style.fontFamily}` as Token),
          transition: 'none',
          filter: `blur(${Math.max(0, (1 - style.scale) * 4)}px)`,
          transformStyle: 'preserve-3d',
          transform: `scale(${style.scale}) rotateX(${style.rotateX}deg) rotateY(${style.rotateY}deg) rotateZ(${style.rotateZ}deg)`,
        }}
      />
    )
  }

  return (
    <>
      <ControlPanel
        blockCount={blockCount}
        initialGlitchIntensity={glitchIntensity}
        initialWireframeColor={wireframeStyle.wireframeColor}
        initialWireframeType={wireframeStyle.type}
        initialWireframeSegments={wireframeStyle.segments}
        onGlitchIntensityChange={setGlitchIntensity}
        onWireframeTypeChange={handleWireframeTypeChange}
        onWireframeSegmentsChange={handleWireframeSegmentsChange}
        onWireframeColorChange={handleWireframeColorChange}
        onRegenerateAll={regenerateAllBlocks}
        onRandomizeWireframe={() => setWireframeStyle(generateRandomWireframeStyle())}
        onRegeneratePositions={regenerateAllPositions}
      />
      
      <Box h="100dvh" position="relative" display="flex" flexDirection="column">
        {/* Positioned blocks */}
        <Box position="relative" h="100%" overflow="hidden">
          {blockStyles.length > 0 &&
            Array.from({ length: blockCount }).map((_, i) => renderBlock(i))}

          {/* Center intro - fixed position */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            width="375px"
            height="375px"
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
          </Box>

          {/* Render either cube or sphere based on wireframeStyle */}
          <Box
            position="absolute"
            style={getWireframePositionStyle(wireframeStyle)}
            zIndex="-1"
          >
            {wireframeStyle.type === 'cube' ? (
              <WireframeCube
                wireframeColor={wireframeStyle.wireframeColor}
                glitchIntensity={glitchIntensity}
              />
            ) : wireframeStyle.type === 'sphere' ? (
              <WireframeSphere
                widthSegments={wireframeStyle.segments}
                heightSegments={wireframeStyle.segments}
                wireframeColor={wireframeStyle.wireframeColor}
                glitchIntensity={glitchIntensity}
              />
            ) : null}
          </Box>
        </Box>
      </Box>
    </>
  )
}