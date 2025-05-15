import { GenerativeBg } from '@/components/generative-bg'
import { ImageFrame } from '@/components/image-frame'
import { Box } from '@/styled-system/jsx'

/**
 * Main page component
 */
export default function Home() {
  return (
    <Box h="100dvh" position="relative" display="flex" flexDirection="column">
      <GenerativeBg />
    </Box>
  )
}
