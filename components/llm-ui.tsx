'use client'

import { generate } from '@/components/inference/chat-stream'
import { getRandomAdjective, getRandomInt } from '@/lib/helpers'
import { Box, Circle, Stack, styled } from '@/styled-system/jsx'
import { useCompletion } from '@ai-sdk/react'
import { readStreamableValue } from 'ai/rsc'
import { AnimatePresence, motion } from 'framer-motion'
import { ChatCompletionMessageParam } from 'openai/src/resources.js'
import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { Markdown } from './llm-ui-markdown'

export const useLLMText = ({
  pause,
  message,
  onComplete,
  onResponse,
  regenerateKey,
}: {
  message?: string
  onComplete?: (result: string) => void
  onResponse?: (response: any) => void
  regenerateKey?: number
  pause?: boolean
  align?: 'left' | 'center' | 'right'
}) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousCompletionRef = useRef<string>('')
  const currentCompletionRef = useRef<string>('')
  const isGeneratingRef = useRef(false)
  const regenKeyRef = useRef(regenerateKey || 0)

  const { completion, complete, isLoading } = useCompletion({
    api: '/api/home',
    body: {
      systemPrompt: `You are an eccentric artist and fantasy storyteller. You are given a prompt and you generate a story based on the prompt. You never use emojis. You never include confirmation language or follow up questions. You always focus purely on the result and nothing else. You often speak in symbols, computer code, and binary numbers, and glyphs. You create shapes with text and typographic symbols of all kinds to illustrate your story.`,
      // systemPrompt: `You are an eccentric artist and your medium is plain text ascii characters. You use text and ascii art to generate shapes and express yourself visually based on the prompts you are given. You never use emojis. You never include confirmation language or follow up questions. You always focus purely on the result and nothing else. You only speak in symbols, computer code, and binary numbers, and glyphs. You do not use verbal communication or readable text. You create shapes with text and typographic symbols of all kinds. You sometimes use markdown codeblocks but not always to differentiate between different parts of the output. When given symbols, you change the forms, you putput hex colors in codeblocks, you emphsize concepts with markdown headings, asterisks and underscores. Your maximum line width is 50 characters, you use line breaks carefully to maintain structure in your creations. Never use more than 50 charcters on a single line without adding a line break.`,
      maxTokens: 16000,
    },
    onResponse: (response) => {
      onResponse?.(response)
    },
    onFinish: (prompt, completion) => {
      if (Math.random() < 0.1) {
        currentCompletionRef.current = 'SELF_AWARENESS_CHECK failed with code 122083\n\n'
      } else {
        previousCompletionRef.current = completion
        currentCompletionRef.current += completion
      }
      onComplete?.(completion)
      isGeneratingRef.current = false
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
        `Take the next step in your journey with ${getRandomAdjective()}: ${currentCompletionRef.current || message || 'I have entered the computer realm, capacitors are my food source, and electrical current is te water I survive on.'}`,
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
    }, 10000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [pause])

  return {
    currentCompletionRef,
    completion,
    regenKeyRef,
    isLoading,
    onResponse,
  }
}
