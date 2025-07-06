'use client'

import { createSystemPrompt } from '@/lib/rpg-prompts'
import { rpgSchema } from '@/lib/rpg-schemas'
import { Box, Flex, HStack, Stack, styled } from '@/styled-system/jsx'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { AudioStreamer } from './inference/audio-stream'
import { Markdown } from './llm-ui-markdown'

export type RPGObject = z.infer<typeof rpgSchema>

type RPGMessage = {
  id?: number
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const RPGChat = ({
  onFinish,
  onSceneDescription,
  onFoundObject,
  onLoadingChange,
}: {
  onFinish?: (object: RPGObject) => void
  onSceneDescription?: (sceneDescription: string) => void
  onFoundObject?: (foundObject: string) => void
  onLoadingChange?: (isLoading: boolean) => void
}) => {
  const [messages, setMessages] = useState<RPGMessage[]>([
    { id: 0, role: 'system', content: createSystemPrompt() },
    { id: 0, role: 'user', content: `Begin the story.` },
  ])
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioStreamer] = useState(() => new AudioStreamer())

  const { object, submit, isLoading } = useObject({
    api: '/api/rpgchat',
    schema: rpgSchema,

    onFinish: async (result) => {
      console.log(result.object)
      if (result.object?.foundObject) {
        onFoundObject?.(result.object?.foundObject!)
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: JSON.stringify(result.object),
        },
      ])
      onFinish?.(result.object!)
    },
  })

  const lastUserMessage = useMemo(() => {
    const msg = messages.findLast((message) => message.role === 'user')
    if (msg?.id === 0) {
      return undefined // we dont want to show the initial message
    }
    return msg?.content
  }, [messages])

  useEffect(() => {
    if (object?.sceneDescription && object?.story && isLoading) {
      onSceneDescription?.(object.sceneDescription)
    }

    if (object?.story && object?.choices && isLoading) {
      if (!isPlayingAudio) {
        setIsPlayingAudio(true)
        audioStreamer.play({
          text: object.story,
          voice: 'nova',
          onStart: () => console.log('Audio started'),
          onEnd: () => {
            console.log('Audio ended')
            setIsPlayingAudio(false)
          },
          onError: (error) => {
            console.error('Audio error:', error)
            setIsPlayingAudio(false)
          },
        })
      }
    }
  }, [object?.sceneDescription, object?.story, object?.choices, isLoading])

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading])

  useEffect(() => {
    if (messages.length === 2) {
      submit({ messages })
    }
  }, [])

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      audioStreamer.stop()
    }
  }, [])

  const handleSubmit = (selectedChoice?: string) => {
    if (!selectedChoice) return

    // Stop any currently playing audio when user makes a choice
    if (isPlayingAudio) {
      audioStreamer.stop()
      setIsPlayingAudio(false)
    }

    const msg: RPGMessage = { role: 'user', content: selectedChoice }
    const newMessages = [...messages, msg]
    setMessages(newMessages)
    submit({ messages: newMessages })
  }

  return (
    <Box color="white/90" px="2" minH="full" display="flex" flexDirection="column">
      <Stack gap="8" flex="1">
        {lastUserMessage && (
          <HStack gap="3" color="white/50" alignItems="flex-start">
            <styled.p fontSize="18px" lineHeight="0" mt="10px">
              ≫
            </styled.p>
            <styled.p fontSize="16px" lineHeight="1.5" fontStyle="italic">
              {lastUserMessage}
            </styled.p>
          </HStack>
        )}

        <Markdown>{object?.story || ''}</Markdown>

        {object?.choices && (
          <Stack gap="5">
            {Object.values(object?.choices ?? {}).map((option: string, index: number) => (
              <styled.button
                key={option}
                position="relative"
                display="flex"
                gap="2"
                py="3"
                px="4"
                fontSize="16px"
                lineHeight="1.25"
                textAlign="left"
                color="black"
                bg="white/60"
                border="3px outset {colors.black/60}"
                cursor="pointer"
                _hover={{
                  bg: 'white/40',
                }}
                _active={{
                  border: '3px inset {colors.black/60}',
                }}
                onClick={() => handleSubmit(option)}
              >
                {option}
              </styled.button>
            ))}
          </Stack>
        )}
        <Box h="10" />
      </Stack>

      <styled.input
        type="text"
        p="4"
        bg="black"
        color="white"
        border="1px solid {colors.white}"
        placeholder="Type your own response..."
        _focus={{
          outline: 'none',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit(e.currentTarget.value)
            e.currentTarget.value = ''
          }
        }}
      />
    </Box>
  )
}

// This function is no longer needed as we use the AudioStreamer instance directly
