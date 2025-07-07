'use client'

import { Flex, styled } from '@/styled-system/jsx'
import { Center } from '@/styled-system/jsx'
import { useGame } from './game-context'
import { RPGGame } from './rpg-game'
import { RetroButton } from './ui/retro-button'

export const GameWrapper = () => {
  const { isStarted, startGame, theme } = useGame()

  return (
    <Flex
      h="100dvh"
      w="full"
      flex="1"
      bg="var(--screen-bg)"
      color="var(--primary)"
      style={
        {
          '--screen-bg': theme.screenBg,
          '--primary': theme.primary,
        } as React.CSSProperties
      }
    >
      {!isStarted ? (
        <Center flex="1">
          <RetroButton onClick={startGame}>Start Game</RetroButton>
        </Center>
      ) : (
        <RPGGame />
      )}
    </Flex>
  )
}
