'use client'

import { LLMCanvas } from '@/components/llm-canvas'
import { defaultConfig } from '@/lib/config'
import { getRandomAdjective, getRandomInt, getRandomSymbolicObject } from '@/lib/helpers'
import { buildPrompt } from '@/lib/promptUtils'
import { Box, styled } from '@/styled-system/jsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ImageFrame } from './image-frame'

interface LLMBlockProps {
  index: number
  content: string
  shouldRegenerate: boolean
  isPaused?: boolean
  onRegenerationStart: () => void
  style?: React.CSSProperties
}

export default function LLMBlock({
  index,
  content,
  shouldRegenerate,
  isPaused,
  onRegenerationStart,
  style,
  ...props
}: LLMBlockProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentText, setCurrentText] = useState(content)

  // Messages passed to the canvas, derived from currentText
  const [message, setMessage] = useState(buildPrompt(currentText))

  // Add a key to force LLMCanvas to rerun when regeneration is triggered
  const [regenerateKey, setRegenerateKey] = useState(0)

  const [imageWidth, setImageWidth] = useState(375)
  const [showImage, setShowImage] = useState(false)

  const glitchProbability = showImage ? 0.1 : 0.05
  const imageProbability = 0
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

  // Whenever this block is flagged for regeneration and isn't currently streaming
  useEffect(() => {
    if (shouldRegenerate && !isStreaming && !isPaused) {
      setIsStreaming(true)
      onRegenerationStart()
      setMessage(buildPrompt(currentText))
      setRegenerateKey((k) => k + 1)
    }
  }, [shouldRegenerate, isStreaming, currentText, onRegenerationStart, isPaused])

  useEffect(() => {
    setShowImage(Math.random() < imageProbability)
    // setImageWidth(Math.random() * 375 + 100)
  }, [regenerateKey])

  // if (showImage) {
  //   return (
  //     <Box
  //       position="absolute"
  //       style={{
  //         top: style?.top,
  //         left: style?.left,
  //         zIndex: style?.zIndex,
  //         width: imageWidth,
  //         mixBlendMode: 'multiply',
  //         transform: style?.transform,
  //         filter: style?.filter,
  //       }}
  //     >
  //       <styled.div ref={rootRef}>
  //         <ImageFrame
  //           onComplete={() => {
  //             setIsStreaming(false)
  //           }}
  //         />
  //       </styled.div>
  //     </Box>
  //   )
  // }

  return (
    <Box style={style} {...props}>
      <styled.div ref={rootRef}>
        <LLMCanvas
          message={message}
          regenerateKey={regenerateKey}
          onComplete={(txt) => {
            setCurrentText(txt)
            setIsStreaming(false)
          }}
        />
      </styled.div>
    </Box>
  )
}
