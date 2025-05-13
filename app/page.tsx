'use client'

import WireframeCube from '@/components/WireframeCube'
import WireframeSphere from '@/components/WireframeSphere'
import { LLMCanvas } from '@/components/llm-canvas'
import Scrambler from '@/components/scrambler'
import { getRandomInt } from '@/lib/helpers'
import { Box, Center, GridItemProps, Stack, styled } from '@/styled-system/jsx'
import { Token, token } from '@/styled-system/tokens'
import { button, folder, useControls } from 'leva'
import { Leva } from 'leva'
import { useCallback, useEffect, useRef, useState } from 'react'

// Define a type for block positioning and scaling
type BlockStyle = {
  top: string
  left: string
  width: number
  scale: number
  zIndex: number
  rotateX: number
  rotateY: number
  rotateZ: number
  bg: string
  fontFamily: string
}

// Define a type for wireframe positioning and properties
type WireframeStyle = {
  top: string
  left: string
  width: string
  height: string
  scale: number
  type: 'cube' | 'sphere' | null
  segments?: number
  wireframeColor: number
}

export default function Home() {
  const intro = {
    heading: "I'm Darek Rossman",
    paragraphs: [
      "I live in St. Pete, FL where I've been working on physical and digital creations for the last two decades",
      'I adapt to complexity and I strive for simplicity. I design for clarity and I build for scale. I lead with curiosity and I ask deeper questions',
    ],
  }

  // There are 8 LLM blocks to position around the viewport
  const blockCount = 9
  // Track multiple blocks to regenerate with a Set of indices
  const [blocksToRegenerate, setBlocksToRegenerate] = useState(new Set<number>())
  // Store position and scale for each block
  const [blockStyles, setBlockStyles] = useState<BlockStyle[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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

  // Add state for glitch intensity
  const [glitchIntensity, setGlitchIntensity] = useState(0.5)

  // Setup Leva control panel first, as generateRandomStyle depends on it
  const controls = useControls({
    animation: folder({
      isPaused: {
        value: false,
        label: 'Pause Animation',
      },
      regenerateInterval: {
        value: 10000,
        min: 1000,
        max: 30000,
        step: 500,
        label: 'Regen Interval (ms)',
      },
      regenerateAll: button(() => regenerateAllBlocks()),
    }),
    wireframe: folder({
      glitchIntensity: {
        value: glitchIntensity,
        min: 0,
        max: 1,
        step: 0.1,
        label: 'Glitch Intensity',
        onChange: (value) => setGlitchIntensity(value),
      },
      wireframeType: {
        value: wireframeStyle.type === null ? 'none' : wireframeStyle.type,
        options: ['none', 'cube', 'sphere'],
        label: 'Wireframe Type',
        onChange: (value) => {
          if (value === 'none') {
            setWireframeStyle({ ...wireframeStyle, type: null })
          } else {
            setWireframeStyle({ ...wireframeStyle, type: value as 'cube' | 'sphere' })
          }
        },
      },
      wireframeSegments: {
        value: wireframeStyle.segments || 12,
        min: 4,
        max: 32,
        step: 1,
        label: 'Segments',
        onChange: (value) => setWireframeStyle({ ...wireframeStyle, segments: value }),
      },
      wireframeColor: {
        value: '#' + wireframeStyle.wireframeColor.toString(16).padStart(6, '0'),
        label: 'Color',
        onChange: (value) => {
          // Convert hex string to number
          const hexValue = parseInt(value.replace('#', ''), 16)
          setWireframeStyle({ ...wireframeStyle, wireframeColor: hexValue })
        },
      },
      randomizeWireframe: button(() => {
        setWireframeStyle(generateRandomWireframeStyle())
      }),
    }),
    blocks: folder({
      blockCount: {
        value: blockCount,
        min: 1,
        max: 20,
        step: 1,
        disabled: true,
        label: 'Block Count',
      },
      glitchProbability: {
        value: 0.05,
        min: 0,
        max: 0.5,
        step: 0.01,
        label: 'Glitch Probability',
      },
      regenerateCount: {
        value: 2,
        min: 1,
        max: 5,
        step: 1,
        label: 'Blocks to Regenerate',
      },
      blockPositionRange: {
        value: { min: -10, max: 75 },
        label: 'Position Range (%)',
      },
      blockScaleRange: {
        value: { min: 0.5, max: 2.8 },
        label: 'Scale Range',
      },
      blockWidthRange: {
        value: { min: 20, max: 40 },
        label: 'Width Range (vw)',
      },
      blockDistributionFactor: {
        value: 4,
        min: 1,
        max: 10,
        step: 0.5,
        label: 'Distribution Factor',
      },
      enableRotation: {
        value: false,
        label: 'Enable 3D Rotation',
      },
      pixelFontProbability: {
        value: 0.1,
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Pixel Font Probability',
      },
      regenerateAllPositions: button(() => {
        // Regenerate positions for all blocks but don't trigger content regeneration
        setBlockStyles((current) => {
          return current.map(() => generateRandomStyle())
        })
      }),
    }),
  })

  // Callback for generating random block styles, memoized with controls as a dependency
  const generateRandomStyle = useCallback((): BlockStyle => {
    // Direct access to controls, assuming Leva provides them after init.
    // Provide defaults for robustness during initial render or if a control is unexpectedly missing.
    const blockPosRange = controls.blockPositionRange || { min: -10, max: 75 }
    const blockScale = controls.blockScaleRange || { min: 0.5, max: 2.8 }
    const blockDistFactor = controls.blockDistributionFactor ?? 4 // Use ?? for primitive types
    const enableRot = controls.enableRotation ?? false
    const blockWidth = controls.blockWidthRange || { min: 20, max: 40 }
    const pixelFontProb = controls.pixelFontProbability ?? 0.1

    return {
      top: `${getRandomInt(blockPosRange.min, blockPosRange.max)}%`,
      left: `${getRandomInt(blockPosRange.min, blockPosRange.max)}%`,
      scale:
        getRandomInt(Math.floor(blockScale.min * 100), Math.floor(blockScale.max * 100), {
          distribution: 'power',
          factor: blockDistFactor,
        }) / 100,
      zIndex: getRandomInt(0, 9, { distribution: 'power', factor: 2 }), // Unchanged, doesn't use controls
      rotateX: enableRot ? getRandomInt(-15, 15) : 0,
      rotateY: enableRot ? getRandomInt(-15, 15) : 0,
      rotateZ: enableRot && Math.random() < 0.1 ? 90 : 0,
      width: getRandomInt(blockWidth.min, blockWidth.max),
      bg: 'transparent',
      fontFamily: Math.random() < pixelFontProb ? 'pixel' : 'sans-serif',
    }
  }, [
    controls.blockPositionRange,
    controls.blockScaleRange,
    controls.blockDistributionFactor,
    controls.enableRotation,
    controls.blockWidthRange,
    controls.pixelFontProbability,
  ])

  // Function to generate random wireframe style
  const generateRandomWireframeStyle = (): WireframeStyle => {
    const top = `${getRandomInt(-15, 75)}%`
    const left = `${getRandomInt(-5, 75)}%`
    const size = `${getRandomInt(50, 250)}px`
    const type = Math.random() < 0.5 ? 'cube' : Math.random() < 0.5 ? 'sphere' : null
    const scale = getRandomInt(80, 150) / 100
    const segments = 12

    // Generate a random color in hex format
    // Using bright, vibrant colors for better visibility
    const colors = [
      0xff0000, // Red
      0x00ff00, // Green
      0x0000ff, // Blue
      0xffff00, // Yellow
      0xff00ff, // Magenta
      0x00ffff, // Cyan
      0xff8000, // Orange
      0x8000ff, // Purple
      0x0080ff, // Light Blue
      0x8fff00, // Lime
      0xff0080, // Hot Pink
      0x000000, // Black (occasionally)
      0xffffff, // White (occasionally)
    ]

    const wireframeColor = colors[getRandomInt(0, colors.length - 1)]

    return {
      top,
      left,
      width: size,
      height: size,
      scale,
      type,
      segments,
      wireframeColor,
    }
  }

  // Generate random positions and scales for blocks on mount
  useEffect(() => {
    const styles: BlockStyle[] = []
    for (let i = 0; i < blockCount; i++) {
      styles.push(generateRandomStyle())
    }
    setBlockStyles(styles)
  }, [blockCount, generateRandomStyle])

  // New useEffect to react to Leva's isPaused control changes for immediate actions
  useEffect(() => {
    if (controls.isPaused) {
      setBlocksToRegenerate(new Set<number>()) // Clear pending regenerations
      // The main interval useEffect will also clear intervalRef.current
    }
  }, [controls.isPaused, setBlocksToRegenerate])

  // Revised useEffect for managing the regeneration interval
  useEffect(() => {
    if (controls.isPaused) {
      // Use Leva's control value directly
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // If not paused, (re)set up the interval
    // Clear previous interval if parameters changed while running
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      const count = Math.min(controls.regenerateCount, blockCount)
      setBlocksToRegenerate((current) => {
        const newSet = new Set(current)
        let attempts = 0
        while (newSet.size < current.size + count && attempts < 10) {
          const randomIndex = getRandomInt(0, blockCount - 1)
          newSet.add(randomIndex)
          attempts++
        }
        return newSet
      })
      setWireframeStyle(generateRandomWireframeStyle())
    }, controls.regenerateInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [controls.isPaused, controls.regenerateInterval, controls.regenerateCount, blockCount])

  // Handle manual regeneration of all blocks
  const regenerateAllBlocks = () => {
    // Add all block indices to the regeneration set
    const allBlocks = new Set<number>()
    for (let i = 0; i < blockCount; i++) {
      allBlocks.add(i)
    }
    setBlocksToRegenerate(allBlocks)

    // Also randomize wireframe when manually regenerating
    setWireframeStyle(generateRandomWireframeStyle())
  }

  // Memoized callback for when a block starts regeneration
  const onBlockRegenerationStart = useCallback(
    (blockIndex: number) => {
      setBlocksToRegenerate((current) => {
        const newSet = new Set(current)
        newSet.delete(blockIndex)
        return newSet
      })
      setBlockStyles((currentStyles) => {
        const updatedStyles = [...currentStyles]
        updatedStyles[blockIndex] = generateRandomStyle()
        return updatedStyles
      })
    },
    [generateRandomStyle], // generateRandomStyle is already memoized
  )

  // Helper to render a single block with its position index
  const renderBlock = (i: number) => {
    const style = blockStyles[i] || { top: '0%', left: '0%', scale: 1, zIndex: 0 }

    return (
      <LLMBlock
        key={i}
        index={i}
        shouldRegenerate={blocksToRegenerate.has(i)}
        glitchProbability={controls.glitchProbability}
        isGloballyPaused={controls.isPaused}
        onRegenerationStart={() => onBlockRegenerationStart(i)}
        content={JSON.stringify(intro)}
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
      <Leva oneLineLabels theme={{ colors: { accent1: '#000' } }} />
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
                <styled.h1>{intro.heading}</styled.h1>
                {intro.paragraphs.map((paragraph, i) => (
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
            style={{
              top: wireframeStyle.top,
              left: wireframeStyle.left,
              width: wireframeStyle.width,
              height: wireframeStyle.height,
            }}
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

function LLMBlock({
  index,
  content,
  shouldRegenerate,
  glitchProbability = 0.05,
  isGloballyPaused,
  onRegenerationStart,
  style,
  ...props
}: {
  index: number
  content: string
  shouldRegenerate: boolean
  glitchProbability?: number
  isGloballyPaused?: boolean
  onRegenerationStart: () => void
  style?: React.CSSProperties
} & GridItemProps) {
  // Keep track of the most recent generation for this block so we can feed it back in
  const [currentText, setCurrentText] = useState(content)
  // Track if this block is currently streaming content
  const [isStreaming, setIsStreaming] = useState(false)
  // Track if this block should display glitch effects
  const [hasGlitchEffects, setHasGlitchEffects] = useState(false)
  // Reference to the block element for applying glitch effects
  const blockRef = useRef<HTMLDivElement>(null)
  // Keep track of timeouts to clear them on unmount
  const timeoutsRef = useRef<number[]>([])

  const adjectives = [
    'Curious',
    'Agile',
    'Resilient',
    'Luminous',
    'Elusive',
    'Quiet',
    'Bold',
    'Fragile',
    'Stark',
    'Witty',
    'Obscure',
    'Radiant',
    'Hollow',
    'Feral',
    'Subtle',
    'Pristine',
    'Jagged',
    'Ironic',
    'Fleeting',
    'Brutal',
    'Serene',
    'Cunning',
    'Timid',
    'Decisive',
    'Abstract',
    'Savage',
    'Soft',
    'Vibrant',
    'Murky',
    'Restless',
  ]

  // Function to apply glitch effects to the block
  const applyGlitchEffects = useCallback(() => {
    if (!blockRef.current || !hasGlitchEffects) return

    const element = blockRef.current
    const originalTransform = style?.transform || ''
    const originalFilter = style?.filter || ''
    const originalOpacity = element.style.opacity || '1'

    // Apply random glitch effects
    const effects = [
      // Text blinking effect
      () => {
        element.style.opacity = '0'
        const timeout = window.setTimeout(
          () => {
            element.style.opacity = originalOpacity
          },
          Math.random() * 100 + 50,
        )
        timeoutsRef.current.push(timeout)
      },

      // Small position jumps
      () => {
        const jumpX = (Math.random() - 0.5) * 10
        const jumpY = (Math.random() - 0.5) * 10
        element.style.transform = `${originalTransform} translate(${jumpX}px, ${jumpY}px)`

        const timeout = window.setTimeout(
          () => {
            element.style.transform = originalTransform
          },
          Math.random() * 200 + 100,
        )
        timeoutsRef.current.push(timeout)
      },

      // Distortion effect (skew/rotation)
      () => {
        const skewX = (Math.random() - 0.5) * 5
        const skewY = (Math.random() - 0.5) * 5
        const scale = getRandomInt(0, 10) / 100

        element.style.transform = `${originalTransform} skew(${skewX}deg, ${skewY}deg) scale(${scale})`

        const timeout = window.setTimeout(
          () => {
            element.style.transform = originalTransform
          },
          Math.random() * 150 + 100,
        )
        timeoutsRef.current.push(timeout)
      },

      // Brief blur effect
      () => {
        element.style.filter = `${originalFilter} blur(2px)`

        const timeout = window.setTimeout(
          () => {
            element.style.filter = originalFilter
          },
          Math.random() * 120 + 80,
        )
        timeoutsRef.current.push(timeout)
      },
    ]

    // Randomly select one effect to apply
    const randomEffect = effects[Math.floor(Math.random() * effects.length)]
    randomEffect()

    // Schedule next glitch effect if still has glitch effects
    if (hasGlitchEffects) {
      const nextGlitchTimeout = window.setTimeout(
        () => {
          applyGlitchEffects()
        },
        Math.random() * 2000 + 1000,
      ) // Apply effect every 1-3 seconds
      timeoutsRef.current.push(nextGlitchTimeout)
    }
  }, [hasGlitchEffects, style])

  // Clean up all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
    }
  }, [])

  // Effect to start/stop glitch effects
  useEffect(() => {
    if (hasGlitchEffects) {
      applyGlitchEffects()

      // Automatically turn off glitch effects after some time
      const disableTimeout = window.setTimeout(() => {
        setHasGlitchEffects(false)
      }, 15000) // Stop effects after 15 seconds
      timeoutsRef.current.push(disableTimeout)
    }
  }, [hasGlitchEffects, applyGlitchEffects])

  const buildPrompt = (base: string) => {
    const adjective = adjectives[getRandomInt(0, adjectives.length - 1)]

    // Generate a random alphanumeric string for the nonce
    // let nonce = ''
    // const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    // const length = getRandomInt(6, 10)
    // for (let i = 0; i < length; i++) {
    //   nonce += chars.charAt(getRandomInt(0, chars.length - 1))
    // }

    const esotericCodePrompt =
      'adding full or partial code snippets if the text is sufficiently strange, using assembly language, javascript, python, cobalt or json'

    const basePrompts = [
      `Rewrite the following text in a ${adjective} way.`,
      `Rewrite the following text in a ${adjective} way, and scramble the name of the person mentioned in strange ways, replacing some letters entirely`,
      `Generate ${adjective} ASCII art.`,
    ]

    const basePromptIndex = Math.random() < 0.8 ? getRandomInt(0, 1) : 2

    const basePrompt = basePrompts[basePromptIndex]

    if (Math.random() < 0.33 && basePromptIndex !== 2) {
      return `${basePrompt}, ${esotericCodePrompt}: ${base}`
    }

    return `${basePrompt}: ${base}`
  }

  // Messages passed to the canvas, derived from currentText
  const [messages, setMessages] = useState([
    {
      role: 'user' as const,
      content: buildPrompt(currentText),
    },
  ])

  // Whenever this block is flagged for regeneration and isn't currently streaming
  useEffect(() => {
    if (shouldRegenerate && !isStreaming && !isGloballyPaused) {
      setIsStreaming(true)
      onRegenerationStart()
      setMessages([
        {
          role: 'user',
          content: buildPrompt(currentText),
        },
      ])

      // Use the glitch probability from controls
      if (Math.random() < glitchProbability) {
        setHasGlitchEffects(true)
      }
    }
  }, [
    shouldRegenerate,
    isStreaming,
    currentText,
    onRegenerationStart,
    glitchProbability,
    isGloballyPaused,
  ])

  return (
    <Box ref={blockRef} style={style} {...props}>
      <LLMCanvas
        messages={messages}
        onComplete={(txt) => {
          setCurrentText(txt)
          setIsStreaming(false) // Mark streaming as done
        }}
      />
    </Box>
  )
}
