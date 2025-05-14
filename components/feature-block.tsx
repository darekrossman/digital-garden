import { defaultIntro } from '@/lib/constants'
import { createClearableInterval } from '@/lib/helpers'
import { Box, Center, Grid, Stack, styled } from '@/styled-system/jsx'
import { startTransition, useEffect, useRef, useState } from 'react'
import Scrambler from './scrambler'

export function FeatureBlock({
  ref,
  isPaused,
}: { ref: React.RefObject<HTMLDivElement | null>; isPaused: boolean }) {
  const [[columns, rows], setGridFactors] = useState([32, 32])
  const [chosenCells, setChosenCells] = useState<number[]>([])
  const [intervalDuration, setIntervalDuration] = useState(1000)
  const [gap, setGap] = useState(0)
  const intervalRef = useRef<{ clear: () => void; id: NodeJS.Timeout } | null>(null)

  const cellCount = rows * columns

  useEffect(() => {
    intervalRef.current = createClearableInterval(() => {
      setChosenCells((prev) => buildCluster(prev, columns, rows, cellCount))
    }, intervalDuration)

    return () => intervalRef.current?.clear()
  }, [columns, rows])

  useEffect(() => {
    if (isPaused) {
      intervalRef.current?.clear()
    }
  }, [isPaused])

  return (
    <Box
      ref={ref}
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      width="376px"
      height="376px"
      overflow="scroll"
      zIndex="20"
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
        {Array.from({ length: cellCount }).map((_, i) => (
          <Box
            key={i}
            style={{
              backgroundColor: chosenCells.includes(i) ? 'transparent' : 'black',
            }}
          />
        ))}
      </Grid>

      <Center color="white" h="full">
        <Stack w="282px" gap="8" textWrap="balance">
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
      </Center>
    </Box>
  )
}

const getNeighbours = (index: number, columns: number, rows: number): number[] => {
  const neighbours: number[] = []
  const row = Math.floor(index / columns)
  const col = index % columns

  // left / right (stay on the same row)
  if (col > 0) neighbours.push(index - 1)
  if (col < columns - 1) neighbours.push(index + 1)

  // up / down (same column)
  if (row > 0) neighbours.push(index - columns)
  if (row < rows - 1) neighbours.push(index + columns)

  return neighbours
}

const unique = (arr: number[]) => Array.from(new Set(arr))

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const buildCluster = (
  prevCluster: number[],
  columns: number,
  rows: number,
  cellCount: number,
): number[] => {
  console.log('buildCluster')

  const clusterSize = randomInt(3, 6)

  // Find a start cell.  Prefer a neighbour of the previous cluster to keep
  // continuity; fall back to a random cell if none exist (e.g. on mount).
  let startCandidates: number[] = []
  if (prevCluster.length) {
    prevCluster.forEach((cell) => {
      startCandidates.push(...getNeighbours(cell, columns, rows))
    })
  }
  startCandidates = unique(startCandidates)

  const startCell = startCandidates.length
    ? startCandidates[randomInt(0, startCandidates.length - 1)]
    : randomInt(0, cellCount - 1)

  const cluster = [startCell]

  // Grow the cluster until we hit the desired size.
  while (cluster.length < clusterSize) {
    // Pick a random seed from the existing cluster and expand from there.
    const seed = cluster[randomInt(0, cluster.length - 1)]
    const neighbours = getNeighbours(seed, columns, rows).filter((n) => !cluster.includes(n))

    if (!neighbours.length) break // nowhere to expand – rare edge case

    const next = neighbours[randomInt(0, neighbours.length - 1)]
    cluster.push(next)
  }

  return cluster
}
