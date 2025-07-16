'use client'

import { Box } from '@/styled-system/jsx'
import { useCompletion } from '@ai-sdk/react'
import { useEffect, useRef } from 'react'
import { Markdown } from './markdown'

const defaultPrompt = `I'm driven by a mix of curiosity and anxiety — a restless fascination with the way complexity gives way to simplicity, and how beauty tends to emerge right at that edge. Early on, I fell in love with electronic music and interface design. I became obsessed with the tools — not just what they could do, but how they could shape ideas, expression, and interaction. My technical skills didn't come from a traditional path. They came from the need to bring creativity to life. I didn't set out to be a developer — I just wanted to make things. And in the process, I discovered that what really drives me is solving problems. That's the common thread in most creative work: understanding something deeply enough to shape it, challenge it, or make it sing. The web became my medium — a space where I could explore systems, sound, design, and behavior all at once. But over the last decade, I've come to care just as much about the people I build with as the things I build. Relationships, trust, clarity — these matter as much as code. I try to bring people along with me: to coach, teach, and share what I've learned. I move ahead only when I can help carry something heavier. I listen closely, because often the most important things people say aren't the ones they say directly. At the end of the day, I'm in it for those shared "wow" moments — the spark when something clicks, when an idea takes shape, when the work matters to more than just me.`

export function LLMCanvas({
  message = defaultPrompt,
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

  const { completion, complete, handleSubmit, data } = useCompletion({
    api: '/api/completion',
    body: {
      maxTokens: Math.floor(Math.random() * 400) + 200,
    },
    onResponse: (response: Response) => {
      console.log('Received response from server:', response)
    },
    onFinish: (completion) => {
      console.log('onFinish', completion)
      isGeneratingRef.current = false
      currentCompletionRef.current = completion
      onComplete?.(completion)
    },
  })

  console.log('completion', data)

  const generate = (probability = 0.3) => {
    if (isGeneratingRef.current) {
      return
    }

    if (Math.random() < probability) {
      isGeneratingRef.current = true
      regenKeyRef.current = regenerateKey ?? regenKeyRef.current + Math.floor(Math.random() * 100)
      complete(currentCompletionRef.current || message || 'I think I am a computer.')
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
    <Box position="relative">
      <Markdown regenerateKey={regenKeyRef.current} align={align}>
        {completion || currentCompletionRef.current}
      </Markdown>
    </Box>
  )
}
