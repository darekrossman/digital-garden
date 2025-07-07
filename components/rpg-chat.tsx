'use client'

import { rpgSchema } from '@/lib/rpg-schemas'
import { Box, Center, Flex, Stack, styled } from '@/styled-system/jsx'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { AudioStreamer } from './inference/audio-stream'
import { useGame } from './game-context'
import { RetroButton } from './ui/retro-button'
import { Typewriter } from './typewriter'
import { Panel } from './ui/panel'
import * as motion from 'motion/react-client'
import { css } from '@/styled-system/css'

export type RPGObject = z.infer<typeof rpgSchema>

type RPGMessage = {
  id?: number
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const RPGChat = ({
  onFinish,
}: {
  onFinish?: (object: RPGObject) => void
}) => {
  const { messages, addMessage, lastUserMessage, setSceneDescription, setIsLoading } = useGame()
  const [audioStreamer] = useState(() => new AudioStreamer())
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const isUserScrollingRef = useRef(false)
  const [typewriterText, setTypewriterText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

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
      setSceneDescription(object.sceneDescription!)
    }

    if (object?.story && object?.choices && isLoading) {
      if (!isPlayingAudio) {
        // setIsPlayingAudio(true)
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
    setIsLoading(isLoading)
  }, [isLoading])

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      audioStreamer.stop()
    }
  }, [])

  // Auto-scroll functionality
  const scrollToBottom = () => {
    if (scrollContainerRef.current && autoScroll) {
      const container = scrollContainerRef.current
      // Temporarily disable user scrolling detection during programmatic scroll
      isUserScrollingRef.current = false
      container.scrollTop = container.scrollHeight
    }
  }

  const isAtBottom = () => {
    if (!scrollContainerRef.current) return false
    const container = scrollContainerRef.current
    const threshold = 50 // Allow for some tolerance
    return container.scrollTop + container.clientHeight >= container.scrollHeight - threshold
  }

  const handleScroll = () => {
    if (!scrollContainerRef.current) return

    const atBottom = isAtBottom()

    if (atBottom && !autoScroll) {
      // User scrolled to bottom, reactivate auto-scroll
      setAutoScroll(true)
    } else if (!atBottom && autoScroll && isUserScrollingRef.current) {
      // User scrolled away from bottom manually, deactivate auto-scroll
      setAutoScroll(false)
    }
  }

  // Auto-scroll when content changes
  useEffect(() => {
    if (autoScroll) {
      // Use a small delay to ensure content is rendered
      const timer = setTimeout(() => {
        scrollToBottom()
      }, 10)
      return () => clearTimeout(timer)
    }
  }, [object?.story, object?.choices, showOptions, autoScroll, typewriterText])

  // Reset auto-scroll when content is cleared (new game/conversation)
  useEffect(() => {
    if (!object?.story && !lastUserMessage) {
      setAutoScroll(true)
      setTypewriterText('')
    }
  }, [object?.story, lastUserMessage])

  // Reset typewriter text when story changes (new story starts)
  useEffect(() => {
    if (object?.story) {
      setTypewriterText('')
    }
  }, [object?.story])

  // Handle scroll events
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let scrollTimeout: NodeJS.Timeout

    const handleScrollEvent = () => {
      // Clear any existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }

      // Set flag to indicate user is scrolling
      isUserScrollingRef.current = true

      // Clear the flag after scrolling stops
      scrollTimeout = setTimeout(() => {
        isUserScrollingRef.current = false
      }, 150)

      // Handle auto-scroll logic
      handleScroll()
    }

    container.addEventListener('scroll', handleScrollEvent, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScrollEvent)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [autoScroll])

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
    submit({ messages: newMessages })
    setShowOptions(false)

    // Blur input field to hide mobile keyboard
    inputRef.current?.blur()

    // Reactivate auto-scroll when user submits a new message
    setAutoScroll(true)
  }

  const list = {
    visible: {
      opacity: 1,
      transition: {
        delay: 0.6,
        when: 'beforeChildren',
        staggerChildren: 0.3,
        duration: 0,
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        when: 'afterChildren',
        duration: 0,
      },
    },
  }

  const item = {
    visible: { opacity: 1, transition: { duration: 0 } },
    hidden: { opacity: 0, transition: { duration: 0 } },
  }

  return (
    <Panel h="full">
      <Flex justifyContent="flex-end" h="full" overflow="hidden">
        <Center position="relative" w="full" h="full" overflow="hidden">
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
                bg: 'var(--screen-bg)',
                borderLeft: '1px solid {var(--primary)}',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'var(--primary)',
              },
              scrollbarWidth: '16px',
            }}
          >
            <Stack minH="full">
              <Stack gap="8" flex="1" p={{ base: '6', md: '12' }}>
                {lastUserMessage && (
                  <styled.pre hideBelow="md">
                    <styled.code
                      fontSize={{ base: '14px', md: '16px' }}
                      lineHeight="1.5"
                      fontStyle="italic"
                      bg="var(--primary)"
                      color="var(--screen-bg)"
                      whiteSpace="pre-wrap"
                    >
                      {lastUserMessage}
                    </styled.code>
                  </styled.pre>
                )}

                <Typewriter
                  text={object?.story || ''}
                  onComplete={() => {
                    setShowOptions(true)
                  }}
                  onTextChange={(displayedText) => {
                    setTypewriterText(displayedText)
                  }}
                />

                {object?.choices && showOptions && (
                  <motion.ul
                    initial="hidden"
                    whileInView="visible"
                    variants={list}
                    className={css({
                      mt: { base: '-18px', md: '-12px' },
                      mb: { base: '8px', md: '12px' },
                    })}
                  >
                    {Object.values(object?.choices ?? {}).map((option: string) => (
                      <motion.li
                        key={option}
                        variants={item}
                        className={css({ mt: { base: '16px', md: '24px' } })}
                      >
                        <RetroButton onClick={() => handleSubmit(option)}>{option}</RetroButton>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </Stack>
            </Stack>
          </Flex>
        </Center>
      </Flex>

      <Box position="relative">
        <Center
          position="absolute"
          top="0px"
          left={{ base: '4', md: '8' }}
          h="full"
          fontSize={{ base: '14px', md: '18px' }}
          lineHeight="0"
        >
          ≫
        </Center>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const value = formData.get('message')
            if (value) {
              handleSubmit(value as string)
              // Clear the input and blur it to hide mobile keyboard
              e.currentTarget.reset()
              inputRef.current?.blur()
            }
          }}
        >
          <styled.input
            ref={inputRef}
            name="message"
            type="text"
            w="full"
            p={{ base: '4', md: '6' }}
            px={{ base: '0', md: '6' }}
            pl={{ base: '10', md: '16' }}
            fontSize="16px"
            lineHeight="1"
            borderTop="1px solid {var(--primary)}"
            placeholder="Choose an option or type your own..."
            enterKeyHint="send"
            autoComplete="off"
            _focus={{
              outline: 'none',
            }}
            _placeholder={{
              fontSize: { base: '14px', md: '16px' },
            }}
          />
        </form>
      </Box>
    </Panel>
  )
}
