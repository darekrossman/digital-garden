import { Box, styled } from '@/styled-system/jsx'

export default function Home() {
  return (
    <Box w="300px" padding="20px" bg="gray.300">
      <styled.h1>Name: Darek Rossman</styled.h1>
      <styled.p>I live in St. Petersburg, Florida, and I make things work beautifully.</styled.p>

      <Box h="6" aria-hidden="true" />

      <styled.h2>What I do</styled.h2>
      <styled.p>
        I solve complex problems with simple systems. I design for clarity, build for scale, and
        think in patterns. I lead with curiosity, ask better questions, and help teams move with
        confidence. My work blends logic, creativity, and an obsession with how things fit together.
      </styled.p>
    </Box>
  )
}
