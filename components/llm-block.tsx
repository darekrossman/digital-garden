'use client'

import { LLMCanvas } from '@/components/llm-canvas'
import { getRandomInt } from '@/lib/helpers'
import { Box } from '@/styled-system/jsx'
import { useCallback, useEffect, useRef, useState } from 'react'

// List of adjectives used for generating prompts
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

interface LLMBlockProps {
  index: number
  content: string
  shouldRegenerate: boolean
  glitchProbability?: number
  isGloballyPaused?: boolean
  onRegenerationStart: () => void
  style?: React.CSSProperties
}

export default function LLMBlock({
  index,
  content,
  shouldRegenerate,
  glitchProbability = 0.05,
  isGloballyPaused,
  onRegenerationStart,
  style,
  ...props
}: LLMBlockProps) {
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

  /**
   * Builds a prompt for the LLM based on the input text
   */
  const buildPrompt = (base: string) => {
    const adjective = adjectives[getRandomInt(0, adjectives.length - 1)]

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

  // Add a key to force LLMCanvas to rerun when regeneration is triggered
  const [regenerateKey, setRegenerateKey] = useState(0)

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
      setRegenerateKey((k) => k + 1)
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

  // Compose static and incoming styles
  const staticStyles: React.CSSProperties = {}
  // Merge static styles with incoming style prop (incoming style takes precedence)
  const mergedStyles: React.CSSProperties = {
    ...staticStyles,
    ...style,
  }

  return (
    <Box
      ref={blockRef}
      maxHeight="100vh"
      position="absolute"
      transformOrigin="center"
      transition="none"
      style={mergedStyles}
      {...props}
    >
      <LLMCanvas
        messages={messages}
        regenerateKey={regenerateKey}
        onComplete={(txt) => {
          setCurrentText(txt)
          setIsStreaming(false) // Mark streaming as done
        }}
      />
    </Box>
  )
}
