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
        bg="orange"
      >
        <styled.h1
          pos="relative"
          fontFamily="majorMono"
          fontSize="4xl"
          fontWeight="extrabold"
          color="white"
          // mixBlendMode="difference"
          zIndex="2"
        >
          ABout Me
        </styled.h1>

        <Box pos="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" zIndex="1">
          <AsteroidVideo />
        </Box>

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
