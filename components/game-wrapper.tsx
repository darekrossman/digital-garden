'use client'

import { Flex, styled } from '@/styled-system/jsx'
import { Center } from '@/styled-system/jsx'
import { useGame } from './game-context'
import { RPGGame } from './rpg-game'
import { RetroButton } from './ui/retro-button'

export const GameWrapper = () => {
  const { isStarted, theme, generatePlot, isGeneratingPlot } = useGame()

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
      {isGeneratingPlot ? (
        <Center flex="1">
          <styled.p>Generating plot...</styled.p>
        </Center>
      ) : !isStarted ? (
        <Center flex="1">
          <RetroButton onClick={generatePlot}>Start Game</RetroButton>
        </Center>
      ) : (
        <RPGGame />
      )}
    </Flex>
  )
}
