'use client'

import { hexToColorMatrix } from '@/lib/helpers'
import { Box, Center, Flex, Grid, HStack, Stack, styled } from '@/styled-system/jsx'
import { token } from '@/styled-system/tokens'
import {
  Scope,
  animate,
  createAnimatable,
  createDraggable,
  createScope,
  createSpring,
  createTimer,
  utils,
} from 'animejs'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRef } from 'react'
import { FeatureBlock } from './feature-block'
import { ImageFrame } from './image-frame'
import { useLLMText } from './llm-ui'
import { Markdown } from './llm-ui-markdown'
import { RPGChat } from './rpg-chat'

export function GenerativeBg() {
  const [pause, setPause] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  // const { currentCompletionRef, completion, regenKeyRef, onResponse, isLoading } = useLLMText({
  //   pause: true,
  // })

  const [isLoading, setIsLoading] = useState(false)
  const [sceneDescription, setSceneDescription] = useState<string | null>(null)
  const [foundObject, setFoundObject] = useState<string | null>(null)

  const scope = useRef<Scope>(null)
  const root = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollNibRef = useRef<HTMLDivElement>(null)

  const rootColor = token('colors.neutral.500')
  const dustMatrix = hexToColorMatrix(rootColor, '0 0 0 -40 10')
  const scrollbarWidth = 16

  // Check if user is at bottom of scroll container
  const isAtBottom = () => {
    if (!scrollContainerRef.current) return false
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    return scrollTop + clientHeight >= scrollHeight - 50 // 10px threshold
  }

  // Auto-scroll to bottom when completion changes, but only if user hasn't scrolled up
  // useEffect(() => {
  //   if (scrollContainerRef.current && !isUserScrolling) {
  //     const scrollContainer = scrollContainerRef.current
  //     scrollContainer.scrollTop = scrollContainer.scrollHeight
  //   }
  // }, [completion, currentCompletionRef.current, isUserScrolling])

  // Handle scroll events to detect manual scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    const nib = scrollNibRef.current
    if (!scrollContainer || !nib) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer

      const y = scrollTop / (scrollHeight - clientHeight)

      console.log(scrollTop, scrollHeight, clientHeight)

      nib.style.transform = `translateY(${y * (clientHeight - scrollbarWidth)}px)`

      const atBottom = isAtBottom()
      console.log('atBottom', atBottom)
      setIsUserScrolling(!atBottom)
    }

    // nib.style.transform = 'translateY(0)'

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [])

  // Function to scroll to bottom manually
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
      setIsUserScrolling(false)
    }
  }

  useEffect(() => {
    if (isLoading) {
      setSceneDescription(null)
    }
  }, [isLoading])

  useEffect(() => {
    scope.current = createScope({ root }).add((self) => {
      const duration = 250

      // createTimer({
      //   duration,
      //   loop: true,
      //   onLoop: (self) => {
      //     const x = utils.random(-1, 1) * 0
      //     const y = utils.random(-1, 1) * 2
      //     const z = utils.random(-1, 1) * 2

      //     if (Math.random() < 0.3) {
      //       return
      //     }

      //     animate('.plane', {
      //       rotateX: { to: `${x}deg`, duration, ease: 'inOut(8)' },
      //       rotateY: { to: `${y}deg`, duration, ease: 'inOut(8)' },
      //       // rotateZ: { to: `${z}deg`, duration, ease: 'inOut(2)' },
      //       translateZ: { to: `${z}px`, duration, ease: 'inOut(12)' },
      //     })
      //   },
      // })
      // const loop = createTimer({
      //   onUpdate: clock => {
      //     const sourceRotate = utils.get($input, 'rotate', false);
      //     const lerpedRotate = utils.get($lerped, 'rotate', false);
      //     utils.set($lerped, {
      //       rotate: utils.lerp(lerpedRotate, sourceRotate, .075) + 'turn'
      //     });
      //   }
      // });

      // utils.set('.plane', {
      // '--tl': '0 0',
      // '--tr': '100% 0',
      // '--br': '100% 100%',
      // '--bl': '0 100%',
      // clipPath: 'polygon(var(--tl), var(--tr), var(--br), var(--bl))',
      // transform: 'rotate3d(1, 1, 1, 0deg)',
      // })

      // animate('.plane', {
      //   '--tl': '-40% 10%',
      //   '--tr': '100% 0',
      //   '--br': '100% 100%',
      //   '--bl': '0 90%',
      //   // transform: 'rotate3d(1, 1, 1, 10deg)',
      //   alternate: true,
      //   loop: true,
      //   loopDelay: 250,
      // })
    })

    // Properly cleanup all anime.js instances declared inside the scope
    return () => scope.current?.revert()
  }, [])

  return (
    <Flex
      h="100dvh"
      position="relative"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      bg="black"
    >
      <Grid
        gridTemplateColumns="1fr 1fr"
        position="relative"
        flex="1"
        gap="12"
        p="12"
        overflow="hidden"
        h="full"
        w="full"
        maxW="1200px"
        maxH="1024px"
      >
        <Center
          ref={root}
          position="relative"
          zIndex="2"
          perspective="1000px"
          justifyContent="flex-end"
          h="full"
          overflow="hidden"
          bg="black"
          boxShadow="8px 8px 0px {colors.white/10}"
        >
          <Center
            position="relative"
            w="full"
            h="full"
            border="1px solid white"
            overflow="hidden"
            bg="white/5"
          >
            <Flex
              position="absolute"
              h="full"
              right="0"
              flexDirection="column"
              color="white"
              borderLeft="1px solid white"
              style={{ width: scrollbarWidth }}
            >
              <Box
                position="absolute"
                opacity="0.4"
                w="full"
                h="full"
                backgroundImage="url(/images/dot.png)"
                backgroundRepeat="repeat"
                backgroundSize="3px 3px"
              />
              <Box
                ref={scrollNibRef}
                bg="white"
                style={{ height: scrollbarWidth, width: scrollbarWidth }}
              />
            </Flex>

            <Center
              ref={scrollContainerRef}
              className="plane"
              w="full"
              height="full"
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="stretch"
              overflowY="scroll"
              overflowX="hidden"
              css={{
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
              }}
            >
              <Box
                className="llmtxt"
                position="relative"
                zIndex="1"
                w="full"
                h="full"
                p="8"
                pr="42px"
              >
                <RPGChat
                  onSceneDescription={setSceneDescription}
                  onFoundObject={setFoundObject}
                  onLoadingChange={setIsLoading}
                />
              </Box>
            </Center>
          </Center>
        </Center>

        <Flex position="relative" flexDirection="column" gap="12">
          <Box
            w="full"
            border="1px solid white"
            boxShadow="8px 8px 0px {colors.white/10}"
            position="relative"
          >
            <Box w="full" aspectRatio="1/1">
              <ImageFrame prompt={sceneDescription} />
            </Box>

            <Center h="140px" p="8" color="white" bg="black" w="full" borderTop="1px solid white">
              <styled.div fontSize="14px" fontStyle="italic" w="full" lineClamp="4">
                {sceneDescription || (
                  <motion.div
                    key={foundObject}
                    animate={{
                      color: ['#888888', '#ffffff', '#888888'],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                    }}
                  >
                    Loading...
                  </motion.div>
                )}
              </styled.div>
            </Center>
          </Box>

          <Stack
            position="relative"
            flex="1"
            p="8"
            border="1px solid white"
            boxShadow="8px 8px 0px {colors.white/10}"
            overflow="hidden"
          >
            {/* {foundObject && (
              <HStack>
                <motion.div
                  key={foundObject}
                  animate={{
                    color: ['#000000', '#ffffff', '#000000'],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    // ease: 'easeInOut',
                  }}
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                  }}
                >
                  ➩
                </motion.div>
                <Box color="white" fontSize="14px">
                  You found a {foundObject}
                </Box>
              </HStack>
            )} */}

            <Stack color="white">
              <HStack fontSize="lg">
                HP:
                <HStack gap="0">
                  {Array.from({ length: 20 }, (_, i) => (
                    <Box key={i} color="white">
                      ▓
                    </Box>
                  ))}
                </HStack>
              </HStack>
              <HStack fontSize="lg">
                MP:
                <HStack gap="0">
                  {Array.from({ length: 20 }, (_, i) => (
                    <Box key={i} color="white">
                      ▓
                    </Box>
                  ))}
                </HStack>
              </HStack>
            </Stack>
            {/* 
            <Box
              pos="absolute"
              right="40px"
              bottom="-120px"
              w="120px"
              aspectRatio="212/592"
              mixBlendMode="plus-lighter"
              zIndex="1"
            >
              <Image
                src="/images/candle.gif"
                alt="candle"
                fill
                style={{
                  objectFit: 'contain',
                }}
              />
            </Box> */}
          </Stack>

          {/* <FeatureBlock isPaused={pause} /> */}
        </Flex>

        {/* <Box pos="fixed" top="0" left="0" zIndex="99999">
          <styled.button bg="black" color="white" py="1" px="2" onClick={() => setPause(!pause)}>
            {pause ? 'resume' : 'pause'}
          </styled.button>
        </Box> */}

        <svg
          viewBox="0 0 250 250"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            inset: '0',
            visibility: 'hidden',
          }}
        >
          <filter
            id="dustFilter"
            colorInterpolationFilters="linearRGB"
            filterUnits="objectBoundingBox"
            primitiveUnits="userSpaceOnUse"
          >
            <feTurbulence
              type="turbulence"
              baseFrequency="0.8 0.8"
              numOctaves="4"
              seed="4"
              stitchTiles="stitch"
              result="turbulence"
            />
            <feColorMatrix type="matrix" values={dustMatrix} in="turbulence" result="colormatrix" />
            <feComposite in="colormatrix" in2="SourceAlpha" operator="in" result="composite" />
            {/* <feTurbulence
              type="turbulence"
              baseFrequency="0.1 0.1"
              numOctaves="1"
              seed="2"
              stitchTiles="stitch"
              result="turbulence1"
            /> */}
            <feDisplacementMap
              in="composite"
              in2="turbulence1"
              scale="20"
              xChannelSelector="R"
              yChannelSelector="B"
              result="displacementMap"
            />
          </filter>
        </svg>
      </Grid>
    </Flex>
  )
}
