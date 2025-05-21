'use client'

import { generate } from '@/components/inference/chat-stream'
import { getRandomInt } from '@/lib/helpers'
import { Box, Stack, styled } from '@/styled-system/jsx'
import { useCompletion } from '@ai-sdk/react'
import { readStreamableValue } from 'ai/rsc'
import { AnimatePresence, motion } from 'framer-motion'
import { ChatCompletionMessageParam } from 'openai/src/resources.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Markdown } from './markdown'

export function LLMCanvas({
  message,
  onComplete,
  regenerateKey,
}: {
  message: string
  onComplete?: (result: string) => void
  regenerateKey?: string | number
}) {
  const [previousGeneration, setPreviousGeneration] = useState<string>('')
  const [currentGeneration, setCurrentGeneration] = useState<string>('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayText, setDisplayText] = useState<string>('')
  const fullGenerationRef = useRef<string>('')

  const UPDATE_INTERVAL_MS = 10
  const lastUpdateTimeRef = useRef<number>(0)

  const [fontScale, setFontScale] = useState(1)

  const { completion, complete } = useCompletion({
    api: '/api/completion',
    onFinish: (prompt, completion) => {
      onComplete?.(completion)
    },
  })

  useEffect(() => {
    complete(message)
    setFontScale(getRandomInt(10, 200) / 100)
  }, [regenerateKey])

  // Handle the word-by-word transition effect
  // useEffect(() => {
  //   if (!isTransitioning) return

  //   // Split text into words for transition
  //   const prevWords = previousGeneration.split(/\s+/)
  //   const newWords = currentGeneration.split(/\s+/)

  //   // Calculate how many words to replace
  //   const totalWords = prevWords.length
  //   const newWordsCount = newWords.length

  //   // Replace more words as we get more new content
  //   const replacementRatio = Math.min(1, newWordsCount / Math.max(10, totalWords))
  //   const wordsToReplace = Math.ceil(totalWords * replacementRatio)

  //   // Create the transition text by replacing words gradually
  //   let transitionWords = [...prevWords]
  //   for (let i = 0; i < wordsToReplace && i < newWordsCount; i++) {
  //     transitionWords[i] = newWords[i]
  //   }

  //   // If we have more new words than previous, add them
  //   if (newWordsCount > wordsToReplace) {
  //     transitionWords = transitionWords.concat(newWords.slice(wordsToReplace))
  //   }

  //   setDisplayText(transitionWords.join(' '))
  // }, [previousGeneration, currentGeneration, isTransitioning])

  const numbers = completion.split(' ').map(Number)

  return (
    <Box position="relative">
      <Stack
        gap="2"
        position="relative"
        zIndex="1"
        style={{
          fontSize: `${fontScale}em`,
        }}
      >
        <Markdown>{completion}</Markdown>
      </Stack>
    </Box>
  )
}
