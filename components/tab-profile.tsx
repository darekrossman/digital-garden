'use client'

import { Box, HStack, Stack, styled } from '@/styled-system/jsx'
import { useGame } from './game-context'
import { ImageCanvas } from './img-canvas'
import ReactMarkdown from 'react-markdown'
import { css } from '@/styled-system/css'

export function ProfileTab() {
  const { plot, playerImage } = useGame()

  const imgSize = 208

  return (
    <Stack gap="8" h="full" overflow="hidden">
      <HStack gap="10" alignItems="flex-start" overflow="hidden">
        <Box w={imgSize + 2} aspectRatio="1" border="1px solid var(--primary)">
          {playerImage && (
            <ImageCanvas src={playerImage} width={imgSize} height={imgSize} minPixelSize={3} />
          )}
        </Box>
        <Stack
          gap="6"
          h="full"
          flex="1"
          overflowY="auto"
          overflowX="hidden"
          css={{
            '&::-webkit-scrollbar': {
              width: '16px',
              height: '16px',
            },
            '&::-webkit-scrollbar-track': {
              bg: 'var(--screen-bg)',
              border: '1px solid {var(--primary)}',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'var(--primary)',
            },
            scrollbarWidth: '16px',
          }}
        >
          <Stack gap="1">
            <styled.h2 fontSize="lg" fontWeight="bold" lineHeight="1">
              {plot?.playerName}
            </styled.h2>
            <styled.p fontSize="sm">
              {plot?.playerAge} / {plot?.playerGender} / {plot?.playerRace}
            </styled.p>
          </Stack>

          <Box h="full" flex="1" pr="12">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <styled.p
                    fontSize="sm"
                    textWrap="pretty"
                    className={css({
                      mb: '16px',
                      '&:last-child': {
                        mb: '0',
                      },
                    })}
                  >
                    {children}
                  </styled.p>
                ),
              }}
            >
              {plot?.playerDescription}
            </ReactMarkdown>
          </Box>
        </Stack>
      </HStack>
    </Stack>
  )
}
