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
        bg="red.600"
      >
        <AsteroidVideo />

        <styled.p
          position="absolute"
          bottom="4"
          left="4"
          fontSize="sm"
          fontFamily="pixel"
          textAlign="center"
        >
          <Link href="/">take me home</Link>
        </styled.p>
      </Box>
    </ViewTransition>
  )
}
