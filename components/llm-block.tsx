'use client'

import { LLMCanvas } from '@/components/llm-canvas'
import { getRandomInt } from '@/lib/helpers'
import { buildPrompt } from '@/lib/promptUtils'
import { Box } from '@/styled-system/jsx'
import { MotionValue, motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

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

// New hook for enhanced parallax effect that moves elements toward their nearest edge
function useParallaxTowardsEdge(
  scrollYProgress: MotionValue<number>,
  elementRef: React.RefObject<HTMLElement>,
  initialStyle?: React.CSSProperties,
  maxDistance = 1500, // Maximum travel distance in pixels
) {
  // Create spring motion values for better animation feel - lower stiffness for smoother motion
  const springX = useSpring(0, { damping: 25, stiffness: 100, mass: 0.8 })
  const springY = useSpring(0, { damping: 25, stiffness: 100, mass: 0.8 })

  // Effect to calculate the target position when element mounts or window resizes
  useLayoutEffect(() => {
    if (!elementRef.current) return

    // Function to calculate vector towards nearest edge
    const calculateEdgeVector = () => {
      const element = elementRef.current
      if (!element) return { dx: 0, dy: 0 }

      // Get element's position and dimensions
      const rect = element.getBoundingClientRect()
      const elementCenterX = rect.left + rect.width / 2
      const elementCenterY = rect.top + rect.height / 2

      // Get viewport dimensions
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Calculate distances to each edge
      const distToLeft = elementCenterX
      const distToRight = viewportWidth - elementCenterX
      const distToTop = elementCenterY
      const distToBottom = viewportHeight - elementCenterY

      // Find the nearest edge
      const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom)

      let dx = 0,
        dy = 0

      // Create a vector pointing to the nearest edge
      if (minDist === distToLeft) {
        // Nearest edge is left
        dx = -1
        dy = 0
      } else if (minDist === distToRight) {
        // Nearest edge is right
        dx = 1
        dy = 0
      } else if (minDist === distToTop) {
        // Nearest edge is top
        dx = 0
        dy = -1
      } else {
        // Nearest edge is bottom
        dx = 0
        dy = 1
      }

      // Adjust by a random angle for variation (within ±45° of the main direction)
      const randomAngle = (Math.random() - 0.5) * (Math.PI / 2) // ±45 degrees
      const cos = Math.cos(randomAngle)
      const sin = Math.sin(randomAngle)

      // Rotate the vector
      const newDx = dx * cos - dy * sin
      const newDy = dx * sin + dy * cos

      // Adjust distance by scale if available in the style
      const scale = extractScale(initialStyle?.transform)
      const adjustedDistance = maxDistance * scale

      return {
        dx: newDx * adjustedDistance,
        dy: newDy * adjustedDistance,
      }
    }

    // Calculate the initial vector
    let vector = calculateEdgeVector()

    // Function to update springs based on scroll progress
    const updateSprings = () => {
      const progress = scrollYProgress.get()
      springX.set(progress * vector.dx)
      springY.set(progress * vector.dy)
    }

    // Initial update
    updateSprings()

    // Subscribe to scroll progress changes
    const unsubscribeScroll = scrollYProgress.onChange(updateSprings)

    // Recalculate on resize
    const handleResize = () => {
      vector = calculateEdgeVector()
      updateSprings()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      unsubscribeScroll()
      window.removeEventListener('resize', handleResize)
    }
  }, [elementRef, initialStyle, scrollYProgress, maxDistance, springX, springY])

  return { deltaX: springX, deltaY: springY }
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
    container: containerRef,
  })

  // Reference to the motion div for parallax calculations
  const motionDivRef = useRef<HTMLDivElement>(null)

  // Use the enhanced parallax hook
  const { deltaX, deltaY } = useParallaxTowardsEdge(
    scrollYProgress,
    motionDivRef as unknown as React.RefObject<HTMLElement>,
    style,
    2500, // Max distance - increased for more dramatic effect
  )

  // Track if this block is currently streaming content
  const [isStreaming, setIsStreaming] = useState(false)
  // Track if this block should display glitch effects
  const [hasGlitchEffects, setHasGlitchEffects] = useState(false)
  // Reference to the content box for applying glitch effects
  const contentBoxRef = useRef<HTMLDivElement>(null)
  // Keep track of timeouts to clear them on unmount
  const timeoutsRef = useRef<number[]>([])
  // Keep track of the most recent generation for this block so we can feed it back in
  const [currentText, setCurrentText] = useState(content)

  // Function to apply glitch effects to the block
  const applyGlitchEffects = useCallback(() => {
    if (!contentBoxRef.current || !hasGlitchEffects) return

    const element = contentBoxRef.current
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
      if (contentBoxRef.current) {
        contentBoxRef.current.style.opacity = '1'
        // Reset transforms if they exist
        if (style?.transform) {
          contentBoxRef.current.style.transform = style.transform
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
        if (contentBoxRef.current) {
          contentBoxRef.current.style.opacity = '1'
        }
      }, 15000) // Stop effects after 15 seconds
      timeoutsRef.current.push(disableTimeout)
    } else {
      // Ensure opacity is reset when glitch effects are turned off
      if (contentBoxRef.current) {
        contentBoxRef.current.style.opacity = '1'
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
      if (contentBoxRef.current) {
        contentBoxRef.current.style.opacity = '1'
        // Reset any transforms that might be stuck
        if (style?.transform) {
          contentBoxRef.current.style.transform = style.transform
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
      style={{
        x: deltaX,
        y: deltaY,
        position: 'absolute',
        left: style?.left,
        top: style?.top,
        width: style?.width,
        height: style?.height,
      }}
      ref={motionDivRef}
    >
      <Box
        maxHeight="100vh"
        position="relative"
        transformOrigin="center"
        transition="none"
        style={{
          ...style,
          position: 'relative',
          left: undefined,
          top: undefined,
          width: '100%',
          height: '100%',
        }}
        ref={contentBoxRef}
        {...props}
      >
        <LLMCanvas
          messages={messages}
          regenerateKey={regenerateKey}
          onComplete={(txt) => {
            setCurrentText(txt)
            setIsStreaming(false) // Mark streaming as done

            // Ensure opacity is reset after regeneration completes
            if (contentBoxRef.current) {
              contentBoxRef.current.style.opacity = '1'
            }
          }}
        />
      </Box>
    </motion.div>
  )
}
