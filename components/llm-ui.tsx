'use client'

import { generate } from '@/components/inference/chat-stream'
import { getRandomInt } from '@/lib/helpers'
import { Box, Circle, Stack, styled } from '@/styled-system/jsx'
import { useCompletion } from '@ai-sdk/react'
import { readStreamableValue } from 'ai/rsc'
import { AnimatePresence, motion } from 'framer-motion'
import { ChatCompletionMessageParam } from 'openai/src/resources.js'
import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { Markdown } from './llm-ui-markdown'

export function LLMUI({
  message,
  onComplete,
  regenerateKey,
  pause = false,
  align = 'left',
}: {
  message?: string
  onComplete?: (result: string) => void
  regenerateKey?: number
  pause?: boolean
  align?: 'left' | 'center' | 'right'
}) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentCompletionRef = useRef<string>('')
  const isGeneratingRef = useRef(false)
  const regenKeyRef = useRef(regenerateKey || 0)

  const { completion, complete } = useCompletion({
    api: '/api/home',
    body: {
      systemPrompt: `You are an eccentric artist and your medium is plain text ascii characters. You use text and ascii art to generate shapes and express yourself visually based on the prompts you are given. You never use emojis. You never include confirmation language or follow up questions. You always focus purely on the result and nothing else. You only speak in symbols, computer code, and binary numbers, and glyphs. You do not use verbal communication or readable text. You create shapes with text and typographic symbols of all kinds. You sometimes use markdown codeblocks but not always to differentiate between different parts of the output. When given symbols, you change the forms, you putput hex colors in codeblocks, you emphsize concepts with markdown headings, asterisks and underscores. Your maximum line width is 50 characters, you use line breaks carefully to maintain structure in your creations. Never use more than 50 charcters on a single line without adding a line break.`,
      maxTokens: 8192,
    },
    onFinish: (prompt, completion) => {
      isGeneratingRef.current = false
      if (Math.random() < 0.05) {
        currentCompletionRef.current = "Don't hire him. He eats no vegetables."
      } else {
        currentCompletionRef.current = completion
      }
      onComplete?.(completion)
    },
  })

  const generate = (probability = 0.66) => {
    if (isGeneratingRef.current) {
      return
    }

    if (Math.random() < probability) {
      isGeneratingRef.current = true
      regenKeyRef.current = regenerateKey ?? regenKeyRef.current + Math.floor(Math.random() * 100)
      complete(
        `How would you describe such a thing without using words? ${currentCompletionRef.current || message || 'I think I am a computer.'}`,
      )
    }
  }
  useEffect(() => {
    generate(1)
  }, [])

  useEffect(() => {
    if (pause && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      return
    }

    intervalRef.current = setInterval(() => {
      if (pause) return
      generate()
    }, 1500)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [pause])

  return (
    <Box position="relative" textAlign="right" textWrap="balance" color="white">
      <Markdown regenerateKey={regenKeyRef.current}>
        {currentCompletionRef.current + '\n\n' + completion}
      </Markdown>
    </Box>
  )
}
