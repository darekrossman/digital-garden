'use client'

import ControlPanel from '@/components/ControlPanel'
import LLMBlock from '@/components/LLMBlock'
import WireframeCube from '@/components/WireframeCube'
import WireframeSphere from '@/components/WireframeSphere'
import Scrambler from '@/components/scrambler'
import {
  generateInitialBlockStyles,
  generateRandomBlockStyle,
  regenerateBlocks,
} from '@/lib/blockUtils'
import { defaultIntro } from '@/lib/constants'
import { createClearableInterval } from '@/lib/helpers'
import { usePageControls } from '@/lib/hooks/usePageControls'
import { generateRandomWireframeStyle, getWireframePositionStyle } from '@/lib/wireframeUtils'
import { Box, Center, Stack, styled } from '@/styled-system/jsx'
import { Token, token } from '@/styled-system/tokens'
import { BlockStyle, WireframeStyle } from '@/types'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Main page component
 */
export default function Home() {
  // Fixed number of blocks to position around the viewport
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
    setBlocksToRegenerate((current) => {
      const newSet = new Set(current)
      newSet.delete(blockIndex)
      return newSet
    })

    setBlockStyles((currentStyles) => {
      const updatedStyles = [...currentStyles]
      updatedStyles[blockIndex] = generateRandomBlockStyle({})
      return updatedStyles
    })
  }, [])

  // Regenerate all block positions but not content
  const regenerateAllPositions = useCallback(() => {
    setBlockStyles((current) => current.map(() => generateRandomBlockStyle({})))
  }, [])

  // Handler for glitch intensity changes
  const handleGlitchIntensityChange = useCallback((intensity: number) => {
    setGlitchIntensity(intensity)
  }, [])

  // Handler for wireframe type changes
  const handleWireframeTypeChange = useCallback((type: 'cube' | 'sphere' | null) => {
    setWireframeStyle((current) => ({ ...current, type }))
  }, [])

  // Handler for wireframe color changes
  const handleWireframeColorChange = useCallback((color: number) => {
    setWireframeStyle((current) => ({ ...current, wireframeColor: color }))
  }, [])

  // Handler for wireframe segments changes
  const handleWireframeSegmentsChange = useCallback((segments: number) => {
    setWireframeStyle((current) => ({ ...current, segments }))
  }, [])

  // Get control panel values using our custom hook
  const controls = usePageControls({
    blockCount,
    initialGlitchIntensity: glitchIntensity,
    initialWireframeColor: wireframeStyle.wireframeColor,
    initialWireframeType: wireframeStyle.type,
    initialWireframeSegments: wireframeStyle.segments || 12,
    onRegenerateAll: regenerateAllBlocks,
    onRandomizeWireframe: () => setWireframeStyle(generateRandomWireframeStyle()),
    onRegeneratePositions: regenerateAllPositions,
  })

  // Generate random positions and scales for blocks on mount
  useEffect(() => {
    const styles = generateInitialBlockStyles(blockCount, () =>
      generateRandomBlockStyle({
        blockPositionRange: controls.blockPositionRange,
        blockScaleRange: controls.blockScaleRange,
        blockWidthRange: controls.blockWidthRange,
        blockDistributionFactor: controls.blockDistributionFactor,
        enableRotation: controls.enableRotation,
        pixelFontProbability: controls.pixelFontProbability,
      }),
    )
    setBlockStyles(styles)
  }, [
    blockCount,
    controls.blockPositionRange,
    controls.blockScaleRange,
    controls.blockWidthRange,
    controls.blockDistributionFactor,
    controls.enableRotation,
    controls.pixelFontProbability,
  ])

  // Handle pause state changes
  useEffect(() => {
    if (controls.isPaused) {
      setBlocksToRegenerate(new Set<number>())
      // The interval will be cleared in the main interval effect
    }
  }, [controls.isPaused])

  // Manage regeneration interval
  useEffect(() => {
    if (controls.isPaused) {
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
      const count = Math.min(controls.regenerateCount, blockCount)
      setBlocksToRegenerate((current) => regenerateBlocks(current, count, blockCount))
      setWireframeStyle(generateRandomWireframeStyle())
    }, controls.regenerateInterval)

    return () => {
      if (intervalRef.current) {
        intervalRef.current.clear()
        intervalRef.current = null
      }
    }
  }, [controls.isPaused, controls.regenerateInterval, controls.regenerateCount, blockCount])

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

    return (
      <LLMBlock
        key={i}
        index={i}
        shouldRegenerate={blocksToRegenerate.has(i)}
        glitchProbability={controls.glitchProbability}
        isGloballyPaused={controls.isPaused}
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
        initialGlitchIntensity={controls.glitchIntensity}
        initialWireframeColor={wireframeStyle.wireframeColor}
        initialWireframeType={wireframeStyle.type}
        initialWireframeSegments={wireframeStyle.segments}
        onGlitchIntensityChange={handleGlitchIntensityChange}
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
          <Box position="absolute" style={getWireframePositionStyle(wireframeStyle)} zIndex="-1">
            {wireframeStyle.type === 'cube' ? (
              <WireframeCube
                wireframeColor={wireframeStyle.wireframeColor}
                glitchIntensity={controls.glitchIntensity}
              />
            ) : wireframeStyle.type === 'sphere' ? (
              <WireframeSphere
                widthSegments={wireframeStyle.segments}
                heightSegments={wireframeStyle.segments}
                wireframeColor={wireframeStyle.wireframeColor}
                glitchIntensity={controls.glitchIntensity}
              />
            ) : null}
          </Box>
        </Box>
      </Box>
    </>
  )
}
