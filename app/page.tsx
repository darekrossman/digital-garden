import { GameProvider } from '@/components/game-context'
import { GameWrapper } from '@/components/game-wrapper'
import { unstable_ViewTransition as ViewTransition } from 'react'

/**
 * Main page component
 */
export default function Home() {
  return (
    <ViewTransition enter="glitch-in" exit="glitch-out">
      <GameProvider>
        <GameWrapper />
      </GameProvider>
    </ViewTransition>
  )
}
