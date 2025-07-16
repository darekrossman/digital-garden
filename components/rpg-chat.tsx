'use client'

import { rpgSchema } from '@/lib/rpg-schemas'
import { Box, Center, Flex, HStack, Stack, styled } from '@/styled-system/jsx'
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
import { RPGObject } from '@/lib/rpg-schemas'
import { stack } from '@/styled-system/patterns'

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
  const {
    messages,
    addMessage,
    lastUserMessage,
    setSceneDescription,
    setIsLoading,
    setImagePrompt,
  } = useGame()
  const [audioStreamer] = useState(() => new AudioStreamer())
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const isUserScrollingRef = useRef(false)
  const [typewriterText, setTypewriterText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const [localMessages, setLocalMessages] = useState<(RPGObject | RPGMessage)[]>([])
  const [visibleOptions, setVisibleOptions] = useState<string[]>([])

  const { object, submit, isLoading } = useObject({
    api: '/api/rpgchat',
    schema: rpgSchema,

    onFinish: async (result) => {
      console.log('turn complete', result.object)

      if (result.error) {
        console.error('onFinish error', result.error)
      }

      if (result.object) {
        setLocalMessages((prev) => [...prev, result.object!])

        addMessage({
          role: 'assistant',
          content: JSON.stringify(result.object),
        })
      }

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
    if (!object) return

    if (isLoading) {
      if (object?.story && object?.imagePrompt) {
        setImagePrompt(object.imagePrompt)
      }

      if (object?.choices && object?.sceneDescription) {
        setSceneDescription(object.sceneDescription!)
      }

      // if (object?.choices && object?.story) {
      //   if (!isPlayingAudio) {
      //     setIsPlayingAudio(true)
      //     audioStreamer.play({
      //       text: object.story,
      //       onStart: () => console.log('Audio started'),
      //       onEnd: () => {
      //         console.log('Audio ended')
      //         setIsPlayingAudio(false)
      //       },
      //       onError: (error) => {
      //         console.error('Audio error:', error)
      //         setIsPlayingAudio(false)
      //       },
      //     })
      //   }
      // }
    }
  }, [object, isLoading])

  useEffect(() => {
    setIsLoading(isLoading)
  }, [isLoading])

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      audioStreamer.stop()
    }
  }, [])

  useEffect(() => {
    if (visibleOptions.length === 3) return

    if (showOptions && object?.choices) {
      let opts = Object.values(object.choices)
      const interval = setInterval(() => {
        if (opts.length > 0) {
          setVisibleOptions((prev) => [...prev, opts.shift()!])
          const atBottom = isAtBottom()

          if (atBottom && !autoScroll) {
            setAutoScroll(true)
          }
        } else {
          clearInterval(interval)
          setAutoScroll(false)
        }
      }, 500)
      return () => clearInterval(interval)
    } else {
      setVisibleOptions([])
    }
  }, [showOptions, object?.choices])

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
    const threshold = 1 // Allow for some tolerance
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
  // useEffect(() => {
  //   if (autoScroll) {
  //     // Use a small delay to ensure content is rendered
  //     const timer = setTimeout(() => {
  //       scrollToBottom()
  //     }, 10)
  //     return () => clearTimeout(timer)
  //   }
  // }, [object?.story, object?.choices, showOptions, autoScroll, typewriterText])

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (autoScroll) {
      // Use a small delay to ensure content is rendered
      timer = setInterval(() => {
        scrollToBottom()
      }, 10)
    } else {
      if (timer) {
        clearInterval(timer)
      }
    }

    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [autoScroll])

  // Reset auto-scroll when content is cleared (new game/conversation)
  useEffect(() => {
    if (!object?.story && !lastUserMessage) {
      setAutoScroll(true)
      setTypewriterText('')
    }
  }, [object?.story, lastUserMessage])

  // Reset typewriter text when story changes (new story starts)
  // useEffect(() => {
  //   if (object?.story) {
  //     setTypewriterText('')
  //   }
  // }, [object?.story])

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
    setLocalMessages((prev) => [...prev, msg])
    submit({ messages: newMessages })
    setVisibleOptions([])
    setShowOptions(false)

    // Blur input field to hide mobile keyboard
    inputRef.current?.blur()

    // Reactivate auto-scroll when user submits a new message
    setAutoScroll(true)
  }

  const list = {
    // visible: {
    //   display: 'block',
    //   opacity: 1,
    //   transition: {
    //     delay: 0.6,
    //     when: 'beforeChildren',
    //     staggerChildren: 0.8,
    //     duration: 0,
    //   },
    // },
    // hidden: {
    //   display: 'none',
    //   opacity: 0,
    //   transition: {
    //     when: 'afterChildren',
    //     duration: 0,
    //   },
    // },
  }

  const item = {
    // visible: { opacity: 1, height: 'auto', overflow: 'visible', transition: { duration: 0 } },
    // hidden: { opacity: 0.4, height: 0, overflow: 'hidden', transition: { duration: 0 } },
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
              <Stack gap="6" flex="1" p={{ base: '6', md: '9' }}>
                {localMessages.map((message, idx) => {
                  const isLastMessage = idx === localMessages.length - 1
                  let text = null
                  if ('story' in message && !isLastMessage) {
                    text = message.story
                  }

                  if ('role' in message && message.role === 'user') {
                    text = (
                      <HStack alignItems="flex-start">
                        <Box mt="-1px">{'>'}</Box>
                        <styled.p lineHeight="1.4">{message.content}</styled.p>
                      </HStack>
                    )
                  }

                  return text ? (
                    <styled.div
                      fontSize={{ base: 'sm', md: 'md' }}
                      lineHeight="1.5"
                      whiteSpace="pre-wrap"
                      key={idx}
                    >
                      {text}
                    </styled.div>
                  ) : null
                })}

                <Typewriter
                  text={object?.story || ''}
                  onComplete={() => {
                    setShowOptions(true)
                  }}
                  onTextChange={(displayedText) => {
                    setTypewriterText(displayedText)
                  }}
                  speed={75}
                />

                {visibleOptions.length > 0 && (
                  <motion.ul
                    initial="hidden"
                    animate="visible"
                    variants={list}
                    className={stack({ gap: '5' })}
                  >
                    {visibleOptions.map((option: string) => (
                      <motion.li key={option} variants={item}>
                        <RetroButton w="full" onClick={() => handleSubmit(option)}>
                          {option}
                        </RetroButton>
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
          left="14px"
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
            p={{ base: '4', md: '4' }}
            px={{ base: '0', md: '6' }}
            pl={{ base: '8', md: '9' }}
            fontSize="md"
            lineHeight="1"
            borderTop="1px solid {var(--primary)}"
            placeholder="Choose an option or type your own..."
            enterKeyHint="send"
            autoComplete="off"
            _focus={{
              outline: 'none',
            }}
            _placeholder={{
              fontSize: { base: 'sm', md: 'md' },
            }}
          />
        </form>
      </Box>
    </Panel>
  )
}
