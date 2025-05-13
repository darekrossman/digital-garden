import { LLMCanvas } from '@/components/llm-canvas'
import Scrambler from '@/components/scrambler'
import { css } from '@/styled-system/css'
import {
  Box,
  Center,
  Flex,
  Grid,
  GridItem,
  GridItemProps,
  Stack,
  styled,
} from '@/styled-system/jsx'
import { Suspense } from 'react'

export default function Home() {
  const intro = {
    heading: "I'm Darek Rossman",
    paragraphs: [
      "I live in St. Pete, FL where I've been working on physical and digital creations for the last two decades.",
      'I adapt to complexity and I strive for simplicity. I design for clarity and I build for scale. I lead with curiosity and I ask deeper questions',
    ],
  }

  return (
    <Box h="100dvh" position="relative" display="flex" flexDirection="column">
      <Grid h="100%" gridTemplateColumns="repeat(3, 1fr)" gridTemplateRows="repeat(3, 1fr)" gap="0">
        <LLMBlock content={JSON.stringify(intro)} />
        <LLMBlock content={JSON.stringify(intro)} />
        <LLMBlock content={JSON.stringify(intro)} />

        <LLMBlock content={JSON.stringify(intro)} />

        <GridItem>
          <Center bg="black" color="white" h="full">
            <Stack w="70%">
              <styled.h1>{intro.heading}</styled.h1>
              {intro.paragraphs.map((paragraph, i) => (
                <styled.p key={i}>{paragraph}</styled.p>
              ))}
            </Stack>
          </Center>
        </GridItem>

        <GridItem bg="gray.600">
          <Center h="100%">Grid Item 6</Center>
        </GridItem>
        <GridItem bg="gray.700">
          <Center h="100%">Grid Item 7</Center>
        </GridItem>
        <GridItem bg="gray.800">
          <Center h="100%">Grid Item 8</Center>
        </GridItem>
        <GridItem bg="gray.900">
          <Center h="100%">Grid Item 9</Center>
        </GridItem>
      </Grid>
    </Box>
  )
}

function LLMBlock({ content, ...props }: { content: string } & GridItemProps) {
  const adjectives = [
    'Curious',
    'Agile',
    'Resilient',
    'Luminous',
    'Elusive',
    'Quiet',
    'Bold',
    'Fragile',
    'Stark',
    'Witty',
    'Obscure',
    'Radiant',
    'Hollow',
    'Feral',
    'Subtle',
    'Pristine',
    'Jagged',
    'Ironic',
    'Fleeting',
    'Brutal',
    'Serene',
    'Cunning',
    'Timid',
    'Decisive',
    'Abstract',
    'Savage',
    'Soft',
    'Vibrant',
    'Murky',
    'Restless',
  ]

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const nonce = Math.random().toString(36).substring(2, 10)
  const contentWithNonce = `${nonce}: Rewrite the following text in a ${adjective} way: ${content}`

  return (
    <GridItem alignSelf="center" justifyItems="center" {...props}>
      <Box maxW="70%">
        <Suspense>
          <LLMCanvas
            messages={[
              {
                role: 'user',
                content: contentWithNonce,
              },
            ]}
          />
        </Suspense>
      </Box>
    </GridItem>
  )
}
