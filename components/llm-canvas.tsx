'use client'

import { Markdown } from '@/components/markdown'
import { generate } from '@/lib/inference'
import { Box, Stack } from '@/styled-system/jsx'
import { readStreamableValue } from 'ai/rsc'
import { ChatCompletionMessageParam } from 'openai/src/resources.js'
import { useCallback, useEffect, useRef, useState } from 'react'

export function LLMCanvas({
  messages,
  onComplete,
  regenerateKey,
}: {
  messages?: ChatCompletionMessageParam[]
  onComplete?: (result: string) => void
  regenerateKey?: string | number
}) {
  // Keep track of both previous and current generation
  const [previousGeneration, setPreviousGeneration] = useState<string>('')
  const [currentGeneration, setCurrentGeneration] = useState<string>('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayText, setDisplayText] = useState<string>('')

  // Reference to store the full generated text
  const fullGenerationRef = useRef<string>('')

  // Throttle interval for streaming updates (ms)
  const UPDATE_INTERVAL_MS = 100
  const lastUpdateTimeRef = useRef<number>(0)

  // Reference to prevent double effect execution in development mode
  const effectRanRef = useRef<string | number | undefined>(undefined)

  const run = useCallback(async () => {
    if (!messages) return

    // Store the current text as previous before starting a new generation
    setPreviousGeneration(fullGenerationRef.current)
    fullGenerationRef.current = ''
    setIsTransitioning(true)

    try {
      const { output } = await generate(messages)
      let newText = ''

      for await (const delta of readStreamableValue(output)) {
        newText += delta
        fullGenerationRef.current = newText

        const now = Date.now()
        if (now - lastUpdateTimeRef.current >= UPDATE_INTERVAL_MS) {
          setCurrentGeneration(newText)
          lastUpdateTimeRef.current = now
        }
      }

      // Ensure the final text is rendered
      setCurrentGeneration(newText)

      if (onComplete) onComplete(fullGenerationRef.current)
    } catch (error) {
      console.error('Error generating text:', error)
    } finally {
      setIsTransitioning(false)
    }
  }, [messages, onComplete, regenerateKey])

  useEffect(() => {
    if (effectRanRef.current === regenerateKey) return
    effectRanRef.current = regenerateKey

    run()
  }, [regenerateKey, run])

  // Handle the word-by-word transition effect
  useEffect(() => {
    if (!isTransitioning) return

    // Split text into words for transition
    const prevWords = previousGeneration.split(/\s+/)
    const newWords = currentGeneration.split(/\s+/)

    // Calculate how many words to replace
    const totalWords = prevWords.length
    const newWordsCount = newWords.length

    // Replace more words as we get more new content
    const replacementRatio = Math.min(1, newWordsCount / Math.max(10, totalWords))
    const wordsToReplace = Math.ceil(totalWords * replacementRatio)

    // Create the transition text by replacing words gradually
    let transitionWords = [...prevWords]
    for (let i = 0; i < wordsToReplace && i < newWordsCount; i++) {
      transitionWords[i] = newWords[i]
    }

    // If we have more new words than previous, add them
    if (newWordsCount > wordsToReplace) {
      transitionWords = transitionWords.concat(newWords.slice(wordsToReplace))
    }

    setDisplayText(transitionWords.join(' '))
  }, [previousGeneration, currentGeneration, isTransitioning])

  return (
    <Box position="relative">
      <Stack gap="2">
        <Markdown>{isTransitioning ? displayText : fullGenerationRef.current}</Markdown>
      </Stack>
    </Box>
  )
}
