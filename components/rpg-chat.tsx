'use client'

import { createSystemPrompt } from '@/lib/rpg-prompts'
import { rpgSchema } from '@/lib/rpg-schemas'
import { Box, Center, Flex, HStack, Stack, styled } from '@/styled-system/jsx'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { AudioStreamer } from './inference/audio-stream'
import { Markdown } from './llm-ui-markdown'
import { useGame } from './game-context'
import { RetroButton } from './ui/retro-button'
import { Scrollbar } from './scrollbar'

export type RPGObject = z.infer<typeof rpgSchema>

type RPGMessage = {
  id?: number
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const RPGChat = ({
  onFinish,
  onSceneDescription,
  onLoadingChange,
}: {
  onFinish?: (object: RPGObject) => void
  onSceneDescription?: (sceneDescription: string) => void
  onLoadingChange?: (isLoading: boolean) => void
}) => {
  const { messages, addMessage, lastUserMessage } = useGame()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioStreamer] = useState(() => new AudioStreamer())

  const { object, submit, isLoading } = useObject({
    api: '/api/rpgchat',
    schema: rpgSchema,

    onFinish: async (result) => {
      console.log('onFinish', result)

      addMessage({
        role: 'assistant',
        content: JSON.stringify(result.object),
      })

      onFinish?.(result.object!)
    },
  })

  useEffect(() => {
    // Submit the initial messages on mount (prevent remounts from auto-submitting again).
    if (messages.length === 2) {
      submit({ messages })
    }
  }, [])

  useEffect(() => {
    if (object?.sceneDescription && object?.story && isLoading) {
      onSceneDescription?.(object.sceneDescription)
    }

    if (object?.story && object?.choices && isLoading) {
      if (!isPlayingAudio) {
        setIsPlayingAudio(true)
        // audioStreamer.play({
        //   text: object.story,
        //   onStart: () => console.log('Audio started'),
        //   onEnd: () => {
        //     console.log('Audio ended')
        //     setIsPlayingAudio(false)
        //   },
        //   onError: (error) => {
        //     console.error('Audio error:', error)
        //     setIsPlayingAudio(false)
        //   },
        // })
      }
    }
  }, [object?.sceneDescription, object?.story, object?.choices, isLoading])

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading])

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
    addMessage(msg)
    console.log(messages)
    submit({ messages: newMessages })
  }

  return (
    <Flex
      h="full"
      flexDirection="column"
      border="1px solid white"
      boxShadow="8px 8px 0px {colors.white/10}"
      overflow="hidden"
    >
      <Flex justifyContent="flex-end" h="full" overflow="hidden">
        <Center position="relative" w="full" h="full" overflow="hidden" bg="white/5">
          <Flex
            ref={scrollContainerRef}
            w="full"
            h="full"
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="stretch"
            overflowY="scroll"
            overflowX="hidden"
            css={{
              '&::-webkit-scrollbar': {
                width: '16px',
                height: '16px',
              },
              '&::-webkit-scrollbar-track': {
                bg: 'transparent',
                borderLeft: '1px solid white',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'white',
              },
              scrollbarWidth: '16px',
            }}
            _after={{
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              w: '16px',
              bgImage: 'url(/images/dot.png)',
              bgRepeat: 'repeat',
              bgSize: '3px 3px',
              opacity: '0.4',
            }}
          >
            <Stack color="white/90" minH="full">
              <Stack gap="8" flex="1" p="8">
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
                      <RetroButton key={option} onClick={() => handleSubmit(option)}>
                        {option}
                      </RetroButton>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Flex>
        </Center>
      </Flex>

      <Box>
        <styled.input
          w="full"
          p="6"
          px="6"
          bg="black"
          color="white"
          borderTop="1px solid {colors.white}"
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
    </Flex>
  )
}

// This function is no longer needed as we use the AudioStreamer instance directly
