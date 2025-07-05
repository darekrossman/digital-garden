'use client'

import { rpgSchema } from '@/lib/rpg-schemas'
import { Box, Flex, HStack, Stack, styled } from '@/styled-system/jsx'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { Markdown } from './llm-ui-markdown'

export type RPGObject = z.infer<typeof rpgSchema>

type RPGMessage = {
  id?: number
  role: 'user' | 'assistant'
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
    { id: 0, role: 'user', content: "Let's begin the adventure!" },
  ])

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
  }, [object?.sceneDescription, object?.story, isLoading])

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading])

  useEffect(() => {
    if (messages.length === 1) {
      submit({ messages })
    }
  }, [])

  const handleSubmit = (selectedChoice?: string) => {
    if (!selectedChoice) return
    const msg: RPGMessage = { role: 'user', content: selectedChoice }
    const newMessages = [...messages, msg]
    setMessages(newMessages)
    submit({ messages: newMessages })
  }

  return (
    <Box color="white/90" px="2">
      <Stack gap="8">
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
    </Box>
  )
}
