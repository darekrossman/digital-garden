'use client'

import { Box, Flex, Grid, HStack, Stack } from '@/styled-system/jsx'
import { useEffect, useRef } from 'react'
import { RPGChat } from './rpg-chat'
import { Panel } from './ui/panel'
import { ImagePanel } from './image-panel'

export function RPGGame() {
  const root = useRef<HTMLDivElement>(null)
  useGlitch(root)

  return (
    <Flex
      h="full"
      w="full"
      position="relative"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
    >
      <Grid
        ref={root}
        gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
        position="relative"
        flex="1"
        gap={{ base: '0', md: '12' }}
        p={{ base: '0', md: '12' }}
        overflow="hidden"
        h="full"
        w="full"
        maxW="1200px"
        maxH="1200px"
        opacity="0"
      >
        {/* Chat */}
        <Box order={{ base: '2', md: '1' }} height={{ base: '60dvh', md: 'full' }}>
          <RPGChat />
        </Box>

        {/* UI */}
        <Grid
          gridTemplateColumns="1fr"
          gridTemplateRows={{ base: '1fr', md: 'auto 1fr' }}
          gap="12"
          minH="0"
          order={{ base: '1', md: '2' }}
        >
          <ImagePanel />

          <Panel p="8" overflow="visible" hideBelow="md">
            <Stack>
              <HStack fontSize="lg">
                HP:
                <HStack gap="0">
                  {Array.from({ length: 20 }, (_, i) => (
                    <Box key={i}>▓</Box>
                  ))}
                </HStack>
              </HStack>
              <HStack fontSize="lg">
                MP:
                <HStack gap="0">
                  {Array.from({ length: 20 }, (_, i) => (
                    <Box key={i}>▓</Box>
                  ))}
                </HStack>
              </HStack>
            </Stack>
          </Panel>
        </Grid>
      </Grid>
    </Flex>
  )
}

function useGlitch(root: React.RefObject<HTMLDivElement | null>) {
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

  const glitch = (count = 1, ms?: number) => {
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
              glitch(count - 1, Math.floor(Math.random() * 50) + 50)
            }
          },
          ms || Math.floor(Math.random() * 50) + 50,
        )
      },
      ms || Math.floor(Math.random() * 50) + 50,
    )
  }
}
