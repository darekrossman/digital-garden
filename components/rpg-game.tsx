'use client'

import { hexToColorMatrix } from '@/lib/helpers'
import { Box, Center, Flex, Grid, HStack, Stack, styled } from '@/styled-system/jsx'
import { token } from '@/styled-system/tokens'

import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useRef } from 'react'
import { ImageFrame } from './image-frame'
import { RPGChat } from './rpg-chat'

export function RPGGame() {
  const [pause, setPause] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [sceneDescription, setSceneDescription] = useState<string | null>(null)

  const root = useRef<HTMLDivElement>(null)

  const rootColor = token('colors.neutral.500')
  const dustMatrix = hexToColorMatrix(rootColor, '0 0 0 -40 10')

  useEffect(() => {
    if (isLoading) {
      setSceneDescription(null)
    }
  }, [isLoading])

  useEffect(() => {
    root.current!.style.opacity = '1'
    glitch(3)

    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        glitch(2)
      }
    }, 20000)

    return () => clearInterval(interval)
  }, [])

  const glitch = (count = 1) => {
    if (count <= 0) return

    const el = root.current!

    if (Math.random() < 0.77) {
      el.style.filter = 'blur(2px) brightness(0.5)'
      el.style.transform = 'translateY(1px) skew(1deg) scale(0.98)'
    } else {
      el.style.filter = 'brightness(0.5)'
      el.style.transform = 'translateX(1px) skew(-1deg)'
    }

    setTimeout(
      () => {
        el.style.filter = ''
        el.style.transform = ''
        setTimeout(
          () => {
            if (count > 0) {
              glitch(count - 1)
            }
          },
          Math.floor(Math.random() * 50) + 50,
        )
      },
      Math.floor(Math.random() * 50) + 50,
    )
  }

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
        ref={root}
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
        opacity="0"
      >
        {/* Chat */}
        <RPGChat onSceneDescription={setSceneDescription} onLoadingChange={setIsLoading} />

        {/* UI */}
        <Grid gridTemplateColumns="1fr" gridTemplateRows="auto 1fr" gap="12" minH="0">
          <Stack
            w="full"
            minH="0"
            maxH="min-content"
            gap="0"
            border="1px solid white"
            boxShadow="8px 8px 0px {colors.white/10}"
            position="relative"
            overflow="hidden"
          >
            <Box overflow="hidden">
              <Box w="full" aspectRatio="1/1" maxH="100%">
                <ImageFrame prompt={sceneDescription} />
              </Box>
            </Box>

            <Center h="140px" p="8" color="white" bg="black" w="full" borderTop="1px solid white">
              <styled.div fontSize="14px" fontStyle="italic" w="full" lineClamp="4">
                {sceneDescription || (
                  <motion.div
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
          </Stack>

          <Stack
            position="relative"
            p="8"
            border="1px solid white"
            boxShadow="8px 8px 0px {colors.white/10}"
            overflow="visible"
          >
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
          </Stack>
        </Grid>
      </Grid>
    </Flex>
  )
}
