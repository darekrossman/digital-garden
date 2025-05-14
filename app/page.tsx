'use client'

import ControlPanel from '@/components/control-panel'
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
import { usePageControls } from '@/lib/hooks/usePageControls'
import { generateRandomWireframeStyle, getWireframePositionStyle } from '@/lib/wireframeUtils'
import { Box, Center, Stack, styled } from '@/styled-system/jsx'
import { Token, token } from '@/styled-system/tokens'
import { BlockStyle, WireframeStyle } from '@/types'
import { MotionValue, motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Main page component
 */
export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Use centralized config for block count
  const blockCount = DEFAULT_CONFIG.blocks.count

  // Track multiple blocks to regenerate with a Set of indices
  const [blocksToRegenerate, setBlocksToRegenerate] = useState(new Set<number>())

  // Store position and scale for each block
  const [blockStyles, setBlockStyles] = useState<BlockStyle[]>([])

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

  // State for glitch intensity - use default from config
  const [glitchIntensity, setGlitchIntensity] = useState(DEFAULT_CONFIG.wireframe.glitchIntensity)

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
  const handleWireframeColorChange = useCallback((color: number | string) => {
    // Normalize the color value to ensure it's a number
    const normalizedColor = typeof color === 'string' ? parseInt(color.replace('#', ''), 16) : color

    setWireframeStyle((current) => ({
      ...current,
      wireframeColor: normalizedColor,
    }))
  }, [])

  // Handler for wireframe segments changes
  const handleWireframeSegmentsChange = useCallback((segments: number) => {
    setWireframeStyle((current) => ({ ...current, segments }))
  }, [])

  // Get control panel values using our custom hook
  const controls = usePageControls({
    onRegenerateAll: regenerateAllBlocks,
    onRandomizeWireframe: () => setWireframeStyle(generateRandomWireframeStyle()),
    onRegeneratePositions: regenerateAllPositions,
    // Pass current state as initial values to maintain synchronization
    initialValues: {
      glitchIntensity,
      wireframeType: wireframeStyle.type === null ? 'none' : wireframeStyle.type,
      wireframeSegments: wireframeStyle.segments,
      wireframeColor: wireframeStyle.wireframeColor,
    },
  })

  // Generate random positions and scales for blocks on mount
  useEffect(() => {
    const styles = generateInitialBlockStyles(blockCount, () =>
      generateRandomBlockStyle({
        blockPositionRange: controls.blockPositionRange,
        blockScaleRange: controls.blockScaleRange,
        blockWidthRange: controls.blockWidthRange,
        blockDistributionFactor: controls.blockDistributionFactor,
        rotateZProbability: controls.rotateZProbability,
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
    controls.rotateZProbability,
    controls.pixelFontProbability,
  ])

  // Sync state with control values
  useEffect(() => {
    setGlitchIntensity(controls.glitchIntensity)
    setWireframeStyle((current) => {
      // Get the wireframe type, converting 'none' to null
      const type = controls.wireframeType === 'none' ? null : controls.wireframeType

      // Handle color conversion if needed
      const color =
        typeof controls.wireframeColor === 'string' && controls.wireframeColor.startsWith('#')
          ? parseInt(controls.wireframeColor.replace('#', ''), 16)
          : controls.wireframeColor

      return {
        ...current,
        type,
        segments: controls.wireframeSegments,
        wireframeColor: color as number,
      }
    })
  }, [
    controls.glitchIntensity,
    controls.wireframeType,
    controls.wireframeSegments,
    controls.wireframeColor,
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

    const filter = `blur(${style.scale < 1 ? Math.floor((1 - style.scale) * 5) : 0}px)`

    console.log(style.scale, filter)
    return (
      <LLMBlock
        key={i}
        index={i}
        containerRef={containerRef}
        shouldRegenerate={blocksToRegenerate.has(i)}
        glitchProbability={controls.glitchProbability}
        isGloballyPaused={controls.isPaused}
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
      {/* Use the control panel component normally - all state is centralized */}
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
