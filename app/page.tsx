import Asteroid from '@/components/asteroid'
import { AsteroidVideo } from '@/components/asteroid-video'
import { Box, styled } from '@/styled-system/jsx'
import Link from 'next/link'
import { unstable_ViewTransition as ViewTransition } from 'react'

export default function Me() {
  return (
    <ViewTransition enter="glitch-in" exit="glitch-out">
      <Box
        h="100dvh"
        position="relative"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <AsteroidVideo />

        <styled.p
          position="absolute"
          bottom="4"
          left="4"
          fontSize="sm"
          fontFamily="pixel"
          textAlign="center"
          zIndex="1"
        >
          <Link href="/game">play a game</Link>
        </styled.p>
      </Box>
    </ViewTransition>
  )
}
