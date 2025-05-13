'use client'

import { generate } from '@/lib/inference'
import { Markdown } from '@/lib/markdown'
import { css } from '@/styled-system/css'
import { Box, Stack, styled } from '@/styled-system/jsx'
import { readStreamableValue } from 'ai/rsc'
import { ChatCompletionMessageParam } from 'openai/src/resources.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import WireframeCube from './WireframeCube'

export function LLMCanvas({
  messages,
  onComplete,
}: {
  messages?: ChatCompletionMessageParam[]
  onComplete?: (result: string) => void
}) {
  // Keep track of both previous and current generation
  const [previousGeneration, setPreviousGeneration] = useState<string>('')
  const [currentGeneration, setCurrentGeneration] = useState<string>('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayText, setDisplayText] = useState<string>('')

  // Reference to store the full generated text
  const fullGenerationRef = useRef<string>('')

  const run = async () => {
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
        setCurrentGeneration(newText)
      }

      if (onComplete) onComplete(fullGenerationRef.current)
    } catch (error) {
      console.error('Error generating text:', error)
    } finally {
      setIsTransitioning(false)
    }
  }

  useEffect(() => {
    run()
  }, [])

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
