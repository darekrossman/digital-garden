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
  regenerateKey: number
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
    // experimental_throttle: 50,
    onFinish: (prompt, completion) => {
      setCurrentGeneration(completion)
      onComplete?.(completion)
      setIsTransitioning(false)
    },
  })

  useEffect(() => {
    if (isTransitioning) return

    setIsTransitioning(true)
    complete(currentGeneration || message)
    setFontScale(getRandomInt(10, 200) / 100)
  }, [regenerateKey])

  return (
    <Box position="relative">
      <Stack
        gap="2"
        position="relative"
        zIndex="1"
        style={{
          transform: `scale(${fontScale})`,
          fontSize: `${fontScale}em`,
        }}
      >
        <Markdown regenerateKey={regenerateKey}>{completion || currentGeneration}</Markdown>
      </Stack>
    </Box>
  )
}
