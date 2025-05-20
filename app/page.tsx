import { GenerativeBg } from '@/components/generative-bg'
import { Box } from '@/styled-system/jsx'
import { unstable_ViewTransition as ViewTransition } from 'react'

/**
 * Main page component
 */
export default function Home() {
  return (
    <ViewTransition enter="glitch-in" exit="glitch-out">
      <Box h="100dvh" position="relative" display="flex" flexDirection="column" bg="white">
        <GenerativeBg />
      </Box>
    </ViewTransition>
  )
}
