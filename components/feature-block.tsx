'use client'

import { defaultIntro } from '@/lib/constants'
import { createClearableInterval } from '@/lib/helpers'
import { Box, Center, Grid, Stack, styled } from '@/styled-system/jsx'
import Link from 'next/link'
import { startTransition, useEffect, useRef, useState } from 'react'
import Scrambler from './scrambler'

export function FeatureBlock({
  ref,
  isPaused,
}: { ref?: React.RefObject<HTMLDivElement | null>; isPaused: boolean }) {
  const [[columns, rows], setGridFactors] = useState([32, 32])
  const [chosenCells, setChosenCells] = useState<number[]>([])
  const [intervalDuration, setIntervalDuration] = useState(250)
  const [gap, setGap] = useState('0px')
  const intervalRef = useRef<{ clear: () => void; id: NodeJS.Timeout } | null>(null)

  const cellCount = rows * columns
  const blockSize = 376
  const cellWidth = blockSize / columns
  const cellHeight = blockSize / rows

  return (
    <Box
      ref={ref}
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      width="376px"
      height="376px"
      // overflow="scroll"
      zIndex="20"
      // mixBlendMode="multiply"
      // bg="purple"
    >
      <Grid
        position="absolute"
        inset="0"
        gap="var(--gap)"
        gridTemplateColumns="var(--grid-cols)"
        gridTemplateRows="var(--grid-rows)"
        zIndex="-1"
        style={
          {
            '--gap': gap,
            '--grid-cols': `repeat(${columns}, 1fr)`,
            '--grid-rows': `repeat(${rows}, 1fr)`,
          } as React.CSSProperties
        }
      >
        {Array.from({ length: cellCount }).map((_, i) => {
          const isChosen = chosenCells.includes(i)

          // Roughly half the chosen cells will render as a "+" instead of a circle.
          const renderPlus = isChosen && i % 2 === 0

          return renderPlus ? (
            <Box
              key={i}
              position="relative"
              backgroundColor="transparent"
              style={{ transform: 'rotate(45deg)', transformOrigin: 'center' }}
            >
              {/* vertical bar */}
              <Box
                position="absolute"
                top="0"
                left="50%"
                transform="translateX(-50%)"
                width="20%"
                height="100%"
                backgroundColor="black"
              />
              {/* horizontal bar */}
              <Box
                position="absolute"
                top="50%"
                left="0"
                transform="translateY(-50%)"
                width="100%"
                height="20%"
                backgroundColor="black"
              />
            </Box>
          ) : (
            <Box
              key={i}
              bg="black"
              transition="all 0.1s"
              // style={
              //   {
              //     transform: isChosen ? 'scale(0.7)' : 'scale(1)',
              //     backgroundColor: isChosen ? 'black' : 'black',
              //     borderRadius: isChosen ? '100%' : '0',
              //   } as React.CSSProperties
              // }
            />
          )
        })}
      </Grid>

      <Center color="white" h="full" pos="relative">
        <Stack gap="8" textWrap="balance" style={{ paddingInline: cellWidth * 4 }}>
          <styled.h1
            fontFamily="pixel"
            fontSize="lg"
            textBoxEdge="cap alphabetic"
            textBoxTrim="trim-both"
          >
            {defaultIntro.heading}
          </styled.h1>
          {defaultIntro.paragraphs.map((paragraph, i) => (
            <styled.p key={i} textBoxEdge="cap alphabetic" textBoxTrim="trim-both">
              {paragraph}
              <Scrambler>.</Scrambler>
            </styled.p>
          ))}
        </Stack>

        <Center
          pos="absolute"
          right="0"
          bg="black"
          color="white"
          fontFamily="pixel"
          fontWeight="bolder"
          fontSize="lg"
          borderBottom="1px solid green"
          _hover={{
            color: 'green',
          }}
          style={{
            paddingRight: cellWidth * 4,
            height: cellHeight * 2,
            bottom: cellHeight * 2,
          }}
        >
          <styled.p textAlign="right" textBoxEdge="cap alphabetic" textBoxTrim="trim-both">
            <Link href="/me">Move forward</Link>
          </styled.p>
        </Center>
      </Center>
    </Box>
  )
}
