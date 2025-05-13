'use client'

import { LLMCanvas } from '@/components/llm-canvas'
import Scrambler from '@/components/scrambler'
import { getRandomInt } from '@/lib/helpers'
import { Box, Center, GridItemProps, Stack, styled } from '@/styled-system/jsx'
import { useEffect, useRef, useState } from 'react'

// Define a type for block positioning and scaling
type BlockStyle = {
  top: string
  left: string
  scale: number
  zIndex: number
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
  const blockCount = 8
  // Track multiple blocks to regenerate with a Set of indices
  const [blocksToRegenerate, setBlocksToRegenerate] = useState(new Set<number>())
  // Store position and scale for each block
  const [blockStyles, setBlockStyles] = useState<BlockStyle[]>([])
  // Add states for pausing regeneration
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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
          position: 'absolute',
          top: style.top,
          left: style.left,
          transform: `scale(${style.scale})`,
          zIndex: style.zIndex,
          width: '30vw',
          height: '30vw',
          transition: 'none', // No transitions for instant position changes
          filter: `blur(${Math.max(0, (1 - style.scale) * 4)}px)`, // More blur for smaller scales
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
          width="30vw"
          height="30vw"
          zIndex="20"
        >
          <Center bg="black" color="white" h="full">
            <Stack w="70%">
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

        {/* Control buttons */}
        <Box position="fixed" bottom="20px" right="20px" zIndex="50" display="flex" gap="10px">
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

  const buildPrompt = (base: string) => {
    const adjective =
      adjectives[
        getRandomInt(0, adjectives.length - 1, {
          distribution: 'gaussian', // Use gaussian to favor middle items in the list
          factor: 4,
        })
      ]

    // Generate a random alphanumeric string for the nonce
    // let nonce = ''
    // const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    // const length = getRandomInt(6, 10)
    // for (let i = 0; i < length; i++) {
    //   nonce += chars.charAt(getRandomInt(0, chars.length - 1))
    // }

    const esotericCodePrompt =
      'adding full or partial code snippets if the text is sufficiently strange, using assembly language, javascript, python, cobalt or json'

    const basePrompt = `Rewrite the following text in a ${adjective} way, and scramble the name of the person mentioned in strange ways, replacing some letters entirely`

    if (Math.random() < 0.2) {
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
    }
  }, [shouldRegenerate, isStreaming, currentText, onRegenerationStart])

  return (
    <Box overflow="auto" h="100%" w="100%" aspectRatio="1/1" style={style} {...props}>
      <Box maxW="100%" h="100%" display="flex" alignItems="center">
        <LLMCanvas
          messages={messages}
          onComplete={(txt) => {
            setCurrentText(txt)
            setIsStreaming(false) // Mark streaming as done
          }}
        />
      </Box>
    </Box>
  )
}
