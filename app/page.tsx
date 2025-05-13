'use client'

import WireframeCube from '@/components/WireframeCube'
import WireframeSphere from '@/components/WireframeSphere'
import { LLMCanvas } from '@/components/llm-canvas'
import Scrambler from '@/components/scrambler'
import { getRandomInt } from '@/lib/helpers'
import { Box, Center, GridItemProps, Stack, styled } from '@/styled-system/jsx'
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
  const blockCount = 12
  // Track multiple blocks to regenerate with a Set of indices
  const [blocksToRegenerate, setBlocksToRegenerate] = useState(new Set<number>())
  // Store position and scale for each block
  const [blockStyles, setBlockStyles] = useState<BlockStyle[]>([])
  // Add states for pausing regeneration
  const [isPaused, setIsPaused] = useState(false)
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

  // Function to generate a random style for a block
  const generateRandomStyle = (): BlockStyle => {
    return {
      // Create random positions that stay mostly within viewport
      // but allow some overflow for visual interest
      top: `${getRandomInt(-10, 75)}%`,
      left: `${getRandomInt(-10, 75)}%`,
      // Random scale with values above 1.2 increasingly rare
      // Using power distribution with factor 4 to cluster toward lower values
      scale: getRandomInt(50, 280, { distribution: 'power', factor: 4 }) / 100,
      // Random z-index for layering
      // Use power distribution to favor lower z-indices with occasional high ones
      zIndex: getRandomInt(0, 9, { distribution: 'power', factor: 2 }),
      rotateX: 0,
      rotateY: 0,
      rotateZ: Math.random() < 0.05 ? 90 : 0,
      width: getRandomInt(20, 40),
      bg: 'transparent',
    }
  }

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

    // Create random styles for each block
    for (let i = 0; i < blockCount; i++) {
      styles.push(generateRandomStyle())
    }

    setBlockStyles(styles)
  }, [])

  // Function to start the regeneration interval
  const startRegenerationInterval = () => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set up a new interval
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        // Pick 1-2 random blocks to regenerate
        const randomCount = getRandomInt(1, 2, { distribution: 'power', factor: -1 }) // favor 2 slightly more often

        setBlocksToRegenerate((current) => {
          // Create a new Set based on the current one
          const newSet = new Set(current)

          // Add random blocks until we've added the desired number
          // or tried a reasonable number of times
          let attempts = 0
          while (newSet.size < current.size + randomCount && attempts < 10) {
            const randomIndex = getRandomInt(0, blockCount - 1)
            newSet.add(randomIndex)
            attempts++
          }

          return newSet
        })

        // Also randomize wireframe on each regeneration
        setWireframeStyle(generateRandomWireframeStyle())
      }
    }, 4000) // every 4 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  // Start or stop the interval based on isPaused state
  useEffect(() => {
    return startRegenerationInterval()
  }, [isPaused])

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

  // Toggle pause state
  const togglePause = () => {
    setIsPaused((prev) => !prev)
  }

  // Helper to render a single block with its position index
  const renderBlock = (i: number) => {
    const style = blockStyles[i] || { top: '0%', left: '0%', scale: 1, zIndex: 0 }

    return (
      <LLMBlock
        key={i}
        index={i}
        shouldRegenerate={blocksToRegenerate.has(i)}
        onRegenerationStart={() => {
          // Remove this block from the regeneration set when it starts regenerating
          setBlocksToRegenerate((current) => {
            const newSet = new Set(current)
            newSet.delete(i)
            return newSet
          })

          // Update position and scale when regeneration starts
          setBlockStyles((current) => {
            const updated = [...current]
            updated[i] = generateRandomStyle()
            return updated
          })
        }}
        content={JSON.stringify(intro)}
        style={{
          backgroundColor: style.bg,
          position: 'absolute',
          top: style.top,
          left: style.left,
          zIndex: style.zIndex,
          width: `${style.width}vw`,
          // height: '30vw',
          transition: 'none',
          filter: `blur(${Math.max(0, (1 - style.scale) * 4)}px)`,
          transformStyle: 'preserve-3d',
          transform: `scale(${style.scale}) rotateX(${style.rotateX}deg) rotateY(${style.rotateY}deg) rotateZ(${style.rotateZ}deg)`,
        }}
      />
    )
  }

  return (
    <Box h="100dvh" position="relative" display="flex" flexDirection="column">
      {/* Positioned blocks */}
      <Box position="relative" h="100%" overflow="hidden">
        {blockStyles.length > 0 && Array.from({ length: blockCount }).map((_, i) => renderBlock(i))}

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

        {/* Control buttons */}
        <Box
          position="fixed"
          bottom="20px"
          right="20px"
          zIndex="50"
          display="flex"
          gap="10px"
          alignItems="center"
        >
          <button
            onClick={togglePause}
            style={{
              background: isPaused ? '#4CAF50' : '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            }}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          <button
            onClick={regenerateAllBlocks}
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            }}
          >
            Regenerate All
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#333',
              padding: '4px 12px',
              borderRadius: '4px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            }}
          >
            <label htmlFor="glitch-intensity" style={{ color: 'white', fontSize: '14px' }}>
              Glitch:
            </label>
            <input
              id="glitch-intensity"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={glitchIntensity}
              onChange={(e) => setGlitchIntensity(parseFloat(e.target.value))}
              style={{ width: '100px' }}
            />
            <span
              style={{ color: 'white', fontSize: '14px', minWidth: '30px', textAlign: 'center' }}
            >
              {glitchIntensity.toFixed(1)}
            </span>
          </div>
        </Box>
      </Box>
    </Box>
  )
}

function LLMBlock({
  index,
  content,
  shouldRegenerate,
  onRegenerationStart,
  style,
  ...props
}: {
  index: number
  content: string
  shouldRegenerate: boolean
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
        const rotate = (Math.random() - 0.5) * 2
        element.style.transform = `${originalTransform} skew(${skewX}deg, ${skewY}deg) rotate(${rotate}deg)`

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

    // const basePrompt = `Rewrite the following text in a ${adjective} way, and scramble the name of the person mentioned in strange ways, replacing some letters entirely`

    const basePrompt = `Rewrite the following text in a ${adjective} way.`

    if (Math.random() < 0.33) {
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
    if (shouldRegenerate && !isStreaming) {
      setIsStreaming(true)
      onRegenerationStart()
      setMessages([
        {
          role: 'user',
          content: buildPrompt(currentText),
        },
      ])

      // Randomly determine if this block should have glitch effects (< 5% chance)
      if (Math.random() < 0.05) {
        setHasGlitchEffects(true)
      }
    }
  }, [shouldRegenerate, isStreaming, currentText, onRegenerationStart])

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
