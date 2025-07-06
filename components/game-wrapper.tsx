'use client'

import { styled } from '@/styled-system/jsx'
import { Center } from '@/styled-system/jsx'
import { useGame } from './game-context'
import { RPGGame } from './rpg-game'
import { RetroButton } from './ui/retro-button'

export const GameWrapper = () => {
  const { isStarted, startGame } = useGame()

  return !isStarted ? (
    <Center flex="1" bg="black">
      <RetroButton onClick={startGame}>Start Game</RetroButton>
    </Center>
  ) : (
    <RPGGame />
  )
}
