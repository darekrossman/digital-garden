import { getRandomInt } from '@/lib/helpers'
import { useEffect, useRef } from 'react'

export const useGlitch = (regenerateKey: number, probability: number) => {
  const isPaused = false

  const glitchProbability = probability ?? 0.001

  // Ref for the root container so we can apply glitch effects directly
  const rootRef = useRef<HTMLDivElement>(null)
  const glitchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const originalStylesRef = useRef<{ transform: string; opacity: string; filter: string } | null>(
    null,
  )

  function clearGlitchInterval() {
    if (glitchIntervalRef.current) {
      clearInterval(glitchIntervalRef.current)
      glitchIntervalRef.current = null
    }
  }

  function cleanupGlitchStyles() {
    clearGlitchInterval()
    const el = rootRef.current
    if (el) {
      el.style.transform = ''
      el.style.filter = ''
      el.style.opacity = '1'
    }
  }

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    // Preserve original style values so we can restore them afterwards
    const originalTransform = el.style.transform
    const originalOpacity = el.style.opacity
    const originalFilter = el.style.filter
    originalStylesRef.current = {
      transform: originalTransform,
      opacity: originalOpacity,
      filter: originalFilter,
    }

    if (Math.random() > glitchProbability) {
      cleanupGlitchStyles()
      return
    }

    if (isPaused) {
      return
    }

    const applyGlitch = () => {
      // Transform (jitter)
      if (Math.random() < glitchProbability) {
        const dx = getRandomInt(-2, 1)
        const dy = getRandomInt(-1, 2)
        const skewX = getRandomInt(-1, 0) // random skew between -5 and 5 degrees
        const skewY = getRandomInt(0, 1)
        if (Math.random() < 0.5) {
          el.style.transform = `translate(${dx}px, ${dy}px) skew(${skewX}deg)`
        }
      } else {
        el.style.transform = originalStylesRef.current?.transform || ''
      }

      // Opacity (blink)
      if (Math.random() < glitchProbability) {
        el.style.opacity = Math.random() < 0.05 ? '0' : '1'
      } else {
        el.style.opacity = originalStylesRef.current?.opacity || '1'
      }

      // Blur
      if (Math.random() < glitchProbability) {
        const blur = getRandomInt(0, 1)
        el.style.filter = `blur(${blur}px)`
      } else {
        el.style.filter = originalStylesRef.current?.filter || ''
      }
    }

    // Run every ~120ms for a subtle effect
    clearGlitchInterval()
    glitchIntervalRef.current = setInterval(applyGlitch, 90)

    // Cleanup – clear interval and restore original styles
    return cleanupGlitchStyles
  }, [glitchProbability, isPaused, regenerateKey])

  return rootRef
}
