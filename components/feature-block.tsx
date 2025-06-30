'use client'

import { defaultIntro } from '@/lib/constants'
import { createClearableInterval } from '@/lib/helpers'
import { Box, Center, Flex, Grid, Stack, styled } from '@/styled-system/jsx'
import Link from 'next/link'
import { startTransition, useEffect, useRef, useState } from 'react'
import Scrambler from './scrambler'

export function FeatureBlock({
  ref,
  isPaused,
}: { ref?: React.RefObject<HTMLDivElement | null>; isPaused: boolean }) {
  const [[columns, rows], setGridFactors] = useState([64, 64])
  const [chosenCells, setChosenCells] = useState<number[]>([])
  const [intervalDuration, setIntervalDuration] = useState(250)
  const [gap, setGap] = useState('1px')
  const intervalRef = useRef<{ clear: () => void; id: NodeJS.Timeout } | null>(null)

  const cellCount = rows * columns
  const blockSize = 376
  const cellWidth = blockSize / columns
  const cellHeight = blockSize / rows

  return (
    <Box ref={ref} position="relative" zIndex="1" bg="red.500">
      <Flex
        pos="relative"
        w="360px"
        h="full"
        flexDirection="column"
        justifyContent="center"
        color="white"
      >
        <Stack gap="9" textWrap="balance" style={{ paddingInline: cellWidth * 4 }}>
          <styled.h1
            fontFamily="pixel"
            fontSize="18px"
            lineHeight="0.8"
            // letterSpacing="-12px"
            ml="-2px"
            color="gray.950"
            textBoxEdge="cap alphabetic"
            textBoxTrim="trim-both"
          >
            {defaultIntro.heading}
          </styled.h1>

          {defaultIntro.paragraphs.map((paragraph, i) => (
            <styled.p
              key={i}
              fontSize="12px"
              color="white"
              textBoxEdge="cap alphabetic"
              textBoxTrim="trim-both"
              textTransform="lowercase"
            >
              {paragraph}
              <Scrambler>.</Scrambler>
            </styled.p>
          ))}
        </Stack>
      </Flex>

      <Center
        pos="absolute"
        color="gray.950"
        fontFamily="pixel"
        fontSize="16px"
        style={{
          left: cellWidth * 4,
          bottom: cellWidth * 4,
        }}
        _hover={{
          color: 'white',
        }}
      >
        <styled.p textBoxEdge="cap alphabetic" textBoxTrim="trim-both">
          <Link href="/me">move forward</Link>
        </styled.p>
      </Center>
    </Box>
  )
}
