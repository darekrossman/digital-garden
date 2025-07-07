import { styled } from '@/styled-system/jsx'
import { useEffect, useState, useRef } from 'react'

// Typewriter component for character-by-character text reveal
export const Typewriter = ({
  text,
  speed = 50,
  onComplete,
  onTextChange,
}: {
  text: string
  speed?: number
  onComplete?: () => void
  onTextChange?: (displayedText: string) => void
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [lastTextLength, setLastTextLength] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const blinkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousIndexRef = useRef(0)

  // Start blinking immediately when component mounts
  useEffect(() => {
    blinkIntervalRef.current = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => {
      if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current)
      }
    }
  }, []) // Empty dependency array - only run on mount

  // Reset when text changes significantly (new story)
  useEffect(() => {
    if (text.length < lastTextLength) {
      // Text got shorter - likely new story
      setDisplayedText('')
      setCurrentIndex(0)
      setIsComplete(false)
      setShowCursor(true)
      previousIndexRef.current = 0
    }
    setLastTextLength(text.length)
  }, [text.length, lastTextLength])

  // Handle cursor blinking logic - only when a letter is actually typed
  useEffect(() => {
    // Only act when currentIndex actually increases (a letter was typed)
    if (currentIndex > previousIndexRef.current) {
      // Clear existing timeouts/intervals
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current)
      }

      // Keep cursor lit when typing
      setShowCursor(true)

      // Set timeout to start blinking after 1 second of inactivity
      debounceTimeoutRef.current = setTimeout(() => {
        // Start blinking interval
        blinkIntervalRef.current = setInterval(() => {
          setShowCursor((prev) => !prev)
        }, 500) // Blink every 500ms
      }, 1000) // Wait 1 second before starting to blink
    }

    // Update previous index
    previousIndexRef.current = currentIndex
  }, [currentIndex])

  // Handle end of typing - start blinking when complete
  useEffect(() => {
    if (currentIndex === text.length && text.length > 0 && !isComplete) {
      // Clear any existing timeouts
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current)
      }

      // Start blinking immediately when finished
      blinkIntervalRef.current = setInterval(() => {
        setShowCursor((prev) => !prev)
      }, 500)
    }
  }, [currentIndex, text.length, isComplete])

  // Character-by-character reveal effect with stream-aware timing
  useEffect(() => {
    if (currentIndex < text.length) {
      // Always use consistent delay based on speed
      const delay = 1000 / speed

      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, delay)

      return () => clearTimeout(timeout)
    } else if (currentIndex === text.length && text.length > 0 && !isComplete) {
      // Only mark complete if we have actual text and we've displayed it all
      setIsComplete(true)
      onComplete?.()
    }
  }, [currentIndex, text, speed, isComplete, onComplete])

  // Notify parent when displayed text changes
  useEffect(() => {
    onTextChange?.(displayedText)
  }, [displayedText, onTextChange])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current)
      }
    }
  }, [])

  return (
    <styled.div position="relative">
      <styled.div fontSize="16px" lineHeight="1.6" whiteSpace="pre-wrap" fontFamily="monospace">
        {displayedText}
        <styled.span
          display="inline-block"
          w="10px"
          h="1em"
          bg="var(--primary)"
          ml="1px"
          opacity={showCursor ? 1 : 0}
          verticalAlign="-2px"
          transition="opacity 0.2s ease"
        />
      </styled.div>
    </styled.div>
  )
}
