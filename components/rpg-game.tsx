'use client'

import { Box, Center, Flex, Grid, HStack, Stack, styled } from '@/styled-system/jsx'
import { useEffect, useRef } from 'react'
import { RPGChat } from './rpg-chat'
import { Panel } from './ui/panel'
import { ImagePanel } from './image-panel'
import { VideoCanvas } from './video-canvas'
import { ImageFrame } from './image-frame'
import { useGame } from './game-context'
import { InfoDialog } from './info-dialog'

export function RPGGame() {
  const { plot, setPlayerImage, setInfoDialogOpen } = useGame()

  const root = useRef<HTMLDivElement>(null)
  useGlitch(root)

  useEffect(() => {
    //
  }, [])

  return (
    <Center w="full" h="full">
      <Stack h="full" w="full" maxW="1240px" maxH="1160px" p={{ base: '0', md: '12' }} gap="10">
        <Flex alignItems="center" justifyContent="space-between" w="full" bg="var(--primary)">
          <styled.h1 fontSize="16px" fontWeight="bold" color="var(--screen-bg)">
            {plot?.title}
          </styled.h1>

          <styled.button
            fontSize="16px"
            fontWeight="bold"
            color="var(--screen-bg)"
            onClick={() => setInfoDialogOpen(true)}
          >
            [CTRL+I] Menu
          </styled.button>
        </Flex>

        <Grid
          ref={root}
          gridTemplateColumns={{ base: '1fr', md: '57% 1fr' }}
          gridTemplateRows={{ mdDown: '35dvh 1fr', md: '1fr' }}
          position="relative"
          flex="1"
          gap={{ base: '0', md: '10' }}
          overflow="visible"
          minH="0"
          h="full"
          w="full"
          opacity="0"
        >
          {/* Chat */}
          <Box order={{ base: '2', md: '1' }} h="full" minH="0">
            <RPGChat />
          </Box>

          {/* UI */}
          <Grid
            gridTemplateColumns="1fr"
            gridTemplateRows={{ base: '1fr', md: 'auto 1fr' }}
            gap="10"
            minH="0"
            order={{ base: '1', md: '2' }}
          >
            <ImagePanel />

            <Panel p="6" overflow="visible" hideBelow="md">
              <Flex gap="6">
                <Box
                  w="140px"
                  h="140px"
                  position="relative"
                  border="1px solid var(--primary)"
                  onClick={() => setInfoDialogOpen('profile')}
                >
                  <ImageFrame
                    prompt={plot?.playerImagePrompt}
                    minPixelSize={2}
                    onImageGenerated={setPlayerImage}
                  />
                </Box>

                <Stack>
                  <styled.p fontSize="lg">{plot?.playerName}</styled.p>

                  <HStack fontSize="md">
                    HP:
                    <HStack gap="0">
                      {Array.from({ length: 10 }, (_, i) => (
                        <Box key={i}>▓</Box>
                      ))}
                    </HStack>
                  </HStack>
                  <HStack fontSize="md">
                    MP:
                    <HStack gap="0">
                      {Array.from({ length: 10 }, (_, i) => (
                        <Box key={i}>▓</Box>
                      ))}
                    </HStack>
                  </HStack>
                </Stack>
              </Flex>
            </Panel>
          </Grid>
        </Grid>

        <InfoDialog />

        {/* <audio src="/audio/8-Bit Dark Music.mp3" autoPlay loop /> */}
      </Stack>
    </Center>
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
