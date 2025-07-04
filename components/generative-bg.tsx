'use client'

import { hexToColorMatrix } from '@/lib/helpers'
import { Box, Center, Flex, Grid, styled } from '@/styled-system/jsx'
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
import { unstable_ViewTransition as ViewTransition } from 'react'
import { FeatureBlock } from './feature-block'
import { useLLMText } from './llm-ui'
import { Markdown } from './llm-ui-markdown'

export function GenerativeBg() {
  const [pause, setPause] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const { currentCompletionRef, completion, regenKeyRef, onResponse, isLoading } = useLLMText({
    pause: true,
  })

  const scope = useRef<Scope>(null)
  const root = useRef<HTMLDivElement>(null)
  const planeRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Generate color matrix for the dust effect
  const rootColor = token('colors.neutral.500')
  const dustMatrix = hexToColorMatrix(rootColor, '0 0 0 -40 10')

  // Check if user is at bottom of scroll container
  const isAtBottom = () => {
    if (!scrollContainerRef.current) return false
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    return scrollTop + clientHeight >= scrollHeight - 50 // 10px threshold
  }

  // Auto-scroll to bottom when completion changes, but only if user hasn't scrolled up
  useEffect(() => {
    if (scrollContainerRef.current && !isUserScrolling) {
      const scrollContainer = scrollContainerRef.current
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  }, [completion, currentCompletionRef.current, isUserScrolling])

  // Handle scroll events to detect manual scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const handleScroll = () => {
      const atBottom = isAtBottom()
      console.log('atBottom', atBottom)
      setIsUserScrolling(!atBottom)
    }

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
    <Box h="100dvh" position="relative" display="flex" flexDirection="column" bg="black">
      <Grid gridTemplateColumns="1fr 1fr" position="relative" flex="1" overflow="hidden" gap={0}>
        <Center
          ref={root}
          position="relative"
          zIndex="2"
          perspective="1000px"
          justifyContent="flex-end"
          // alignItems="flex-end"
          h="100dvh"
          overflow="hidden"
          bg="black"
          p="48px"
        >
          <Center
            position="relative"
            w="full"
            h="full"
            border="1px solid white"
            overflow="hidden"
            bg="white/8"
            // pr="16px"
            pl="12px"
            // alignItems="flex-end"
          >
            <Flex
              right="0"
              position="absolute"
              w="20px"
              h="full"
              flexDirection="column"
              color="white"
              bg="black"
              borderLeft="1px solid white"
            >
              <Center>⋀</Center>
              <Box flex="1">
                <Box h="20px" w="20px" bg="white" />
              </Box>
              <Center>⋁</Center>

              {/* <styled.pre lineHeight="1.1" fontSize="lg" color="white/90">
                {Array.from({ length: 120 }, (_, i) => (
                  <Box key={i}>#</Box>
                  // <Box key={i}>≪</Box>
                ))}
              </styled.pre> */}
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
              textAlign="right"
              pr="28px"
              css={{
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
              }}
            >
              <Box flex="1" />
              <Box
                className="llmtxt"
                position="relative"
                zIndex="1"
                color="white"
                w="full"
                // maxWidth="440px"
                transformOrigin="right"
                minHeight="fit-content"
                pb="2"
              >
                <Markdown regenerateKey={regenKeyRef.current}>
                  {isLoading
                    ? currentCompletionRef.current + completion
                    : currentCompletionRef.current}
                </Markdown>
              </Box>
            </Center>
          </Center>

          <Box
            position="absolute"
            left="48px"
            right="48px"
            bottom="24px"
            display="flex"
            alignItems="flex-end"
            color="black"
            bg="white"
            h="21px"
            overflow="hidden"
            border="1px solid white"
            // filter="url(#dustFilter)"
            // transform="scaleY(0.3) scaleX(0.3)"
            transformOrigin="left bottom"
            textAlign="left"
            opacity={1}
            zIndex="2"
          >
            {/* <Markdown regenerateKey={regenKeyRef.current}> */}
            {/* {completion.replaceAll('\n', '===')} */}
            {/* </Markdown> */}
          </Box>
        </Center>

        <Box
          position="relative"
          zIndex="2"
          bg="black"
          // mixBlendMode="difference"
          // backdropFilter="blur(10px)"
        >
          <Box
            pos="absolute"
            right="70px"
            bottom="-100px"
            w="200px"
            aspectRatio="212/592"
            mixBlendMode="plus-lighter"
          >
            <Image
              src="/images/candle.gif"
              alt="candle"
              fill
              style={{
                objectFit: 'contain',
              }}
            />
          </Box>

          <FeatureBlock isPaused={pause} />
        </Box>

        <Box pos="fixed" top="0" left="0" zIndex="99999">
          <styled.button bg="black" color="white" py="1" px="2" onClick={() => setPause(!pause)}>
            {pause ? 'resume' : 'pause'}
          </styled.button>
        </Box>

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
    </Box>
  )
}
