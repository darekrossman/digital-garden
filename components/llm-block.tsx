'use client'

import { LLMCanvas } from '@/components/llm-canvas'
import { getRandomInt } from '@/lib/helpers'
import { buildPrompt } from '@/lib/promptUtils'
import { Box } from '@/styled-system/jsx'
import { MotionValue, motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface LLMBlockProps {
  index: number
  content: string
  shouldRegenerate: boolean
  glitchProbability?: number
  isGloballyPaused?: boolean
  onRegenerationStart: () => void
  style?: React.CSSProperties
  containerRef?: React.RefObject<HTMLDivElement | null>
}

function useParallax(value: MotionValue<number>, distance: number, top?: number) {
  return useTransform(value, [0, 1], [top ?? 0, distance + (top ?? 0)])
}

// Convert a CSS `top` value (px, %, vh) into an absolute pixel amount so we can
// correctly offset the parallax animation. If `window` is not yet defined (e.g.
// during the server render of this client component), percentage based values
// fall back to 0 and will be re-evaluated on the first client render.
function topToPixels(top?: string | number): number {
  if (top == null) return 0

  // Already a raw number – assume it is pixels.
  if (typeof top === 'number') return top

  const value = top.trim()

  // Handle viewport-height units (e.g. 50vh)
  if (value.endsWith('vh')) {
    const num = parseFloat(value.slice(0, -2))
    if (typeof window !== 'undefined') {
      return (num / 100) * window.innerHeight
    }
    return 0 // SSR fallback – will be recalculated client-side.
  }

  // Handle percentage units (e.g. 20%)
  if (value.endsWith('%')) {
    const num = parseFloat(value.slice(0, -1))
    if (typeof window !== 'undefined') {
      return (num / 100) * window.innerHeight
    }
    return 0
  }

  // Handle pixel units (e.g. 120px)
  if (value.endsWith('px')) {
    return parseFloat(value.slice(0, -2))
  }

  // Fallback – try to parse whatever numeric part exists.
  return parseFloat(value)
}

// Extracts the first numeric value inside a CSS `scale(...)` transform.
// Returns 1 (no scaling) if it cannot be found.
function extractScale(transform?: string): number {
  if (!transform) return 1

  const match = transform.match(/scale\(([^)]+)\)/)
  if (match?.[1]) {
    const num = parseFloat(match[1])
    return isNaN(num) ? 1 : num
  }

  return 1
}

export default function LLMBlock({
  index,
  content,
  shouldRegenerate,
  glitchProbability = 0.05,
  isGloballyPaused,
  onRegenerationStart,
  style,
  containerRef,
  ...props
}: LLMBlockProps) {
  const targetRef = useRef(null)
  const { scrollYProgress } = useScroll({
    // target: targetRef,
    container: containerRef,
    // layoutEffect: false,
  })

  // Convert the supplied top style (which may be in % or vh) into pixels so the
  // parallax hook adds the correct absolute offset.
  const initialTop = topToPixels(style?.top as string | number)

  // Adjust the parallax distance by any `scale(...)` transform so that smaller
  // elements move proportionally slower (or faster, depending on your design).
  const scale = extractScale(style?.transform)
  const parallaxDistance = 375 * scale

  const y = useParallax(scrollYProgress, parallaxDistance, initialTop)

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
            // Ensure opacity is reset to 1 if originalOpacity is empty
            element.style.opacity = originalOpacity === '1' ? '1' : originalOpacity
          },
          Math.random() * 100 + 50,
        )

        // Safety timeout to ensure opacity is always reset even if the main timeout fails
        const safetyTimeout = window.setTimeout(
          () => {
            if (element.style.opacity === '0') {
              element.style.opacity = '1'
            }
          },
          300, // Safety timeout after 300ms
        )

        timeoutsRef.current.push(timeout, safetyTimeout)
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
        const scale = getRandomInt(80, 120) / 100

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

  // Clean up all timeouts and reset styles on unmount
  useEffect(() => {
    return () => {
      // Clear all pending timeouts
      timeoutsRef.current.forEach(clearTimeout)

      // Ensure opacity is reset before unmounting
      if (blockRef.current) {
        blockRef.current.style.opacity = '1'
        // Reset transforms if they exist
        if (style?.transform) {
          blockRef.current.style.transform = style.transform
        }
      }
    }
  }, [style?.transform])

  // Effect to start/stop glitch effects
  useEffect(() => {
    if (hasGlitchEffects) {
      applyGlitchEffects()

      // Automatically turn off glitch effects after some time
      const disableTimeout = window.setTimeout(() => {
        setHasGlitchEffects(false)

        // Explicitly reset opacity when glitch effects end
        if (blockRef.current) {
          blockRef.current.style.opacity = '1'
        }
      }, 15000) // Stop effects after 15 seconds
      timeoutsRef.current.push(disableTimeout)
    } else {
      // Ensure opacity is reset when glitch effects are turned off
      if (blockRef.current) {
        blockRef.current.style.opacity = '1'
      }
    }
  }, [hasGlitchEffects, applyGlitchEffects])

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
      // Reset any existing timeouts and glitch effects
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []

      // Ensure opacity and transforms are reset
      if (blockRef.current) {
        blockRef.current.style.opacity = '1'
        // Reset any transforms that might be stuck
        if (style?.transform) {
          blockRef.current.style.transform = style.transform
        }
      }

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
    style?.transform,
  ])

  return (
    <motion.div
      initial={{ visibility: 'hidden' }}
      animate={{ visibility: 'visible' }}
      style={{ y }}
      ref={blockRef}
    >
      <Box
        maxHeight="100vh"
        position="absolute"
        transformOrigin="center"
        transition="none"
        style={style}
        {...props}
      >
        <LLMCanvas
          messages={messages}
          regenerateKey={regenerateKey}
          onComplete={(txt) => {
            setCurrentText(txt)
            setIsStreaming(false) // Mark streaming as done

            // Ensure opacity is reset after regeneration completes
            if (blockRef.current) {
              blockRef.current.style.opacity = '1'
            }
          }}
        />
      </Box>
    </motion.div>
  )
}
