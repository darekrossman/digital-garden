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
  const [intervalDuration, setIntervalDuration] = useState(150)
  const [gap, setGap] = useState(0)
  const intervalRef = useRef<{ clear: () => void; id: NodeJS.Timeout } | null>(null)

  const cellCount = rows * columns

  // useEffect(() => {
  //   // Always clear any existing interval first.
  //   intervalRef.current?.clear()

  //   if (isPaused) return // Do not restart interval while paused.

  //   intervalRef.current = createClearableInterval(() => {
  //     if (Math.random() < 0.1) {
  //       setChosenCells((prev) => buildCluster(prev, columns, rows, cellCount))
  //     }
  //   }, intervalDuration)

  //   return () => intervalRef.current?.clear()
  // }, [columns, rows, intervalDuration, isPaused])

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
        {Array.from({ length: cellCount }).map((_, i) => {
          const isChosen = chosenCells.includes(i)

          return (
            <Box
              key={i}
              style={{
                backgroundColor: isChosen ? 'transparent' : 'black',
              }}
            />
          )
        })}
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

const isEdgeCell = (index: number, columns: number, rows: number): boolean => {
  const row = Math.floor(index / columns)
  const col = index % columns
  return row === 0 || row === rows - 1 || col === 0 || col === columns - 1
}

// Cells that are either on the edge OR directly adjacent (one step) to an edge cell.
// I.e. any cell whose row/col index is 0, 1, rows-2, rows-1 or 0, 1, columns-2, columns-1.
const isNearEdgeCell = (index: number, columns: number, rows: number): boolean => {
  const row = Math.floor(index / columns)
  const col = index % columns
  return row <= 1 || row >= rows - 2 || col <= 1 || col >= columns - 2
}

const buildCluster = (
  prevCluster: number[],
  columns: number,
  rows: number,
  cellCount: number,
): number[] => {
  const edgesCount = 2 * (columns + rows) - 4
  const clusterSize = Math.min(randomInt(4, 16), edgesCount)

  // Prefer near-edge neighbours from the previous cluster to keep some continuity
  let startCandidates: number[] = []
  if (prevCluster.length) {
    prevCluster.forEach((cell) => {
      startCandidates.push(
        ...getNeighbours(cell, columns, rows).filter((n) => isNearEdgeCell(n, columns, rows)),
      )
    })
  }
  startCandidates = unique(startCandidates)

  // Pick a valid start cell
  let startCell = randomInt(0, cellCount - 1)
  if (startCandidates.length) {
    startCell = startCandidates[randomInt(0, startCandidates.length - 1)]
  } else {
    let guard = 0
    while (!isNearEdgeCell(startCell, columns, rows) && guard < 200) {
      startCell = randomInt(0, cellCount - 1)
      guard++
    }
  }

  const cluster: number[] = [startCell]

  while (cluster.length < clusterSize) {
    const JUMP_PROBABILITY = 0
    const shouldJump = Math.random() < JUMP_PROBABILITY

    if (shouldJump) {
      // Jump to a random unused near-edge cell
      let candidate = randomInt(0, cellCount - 1)
      let guard = 0
      while (
        (!isNearEdgeCell(candidate, columns, rows) || cluster.includes(candidate)) &&
        guard < 100
      ) {
        candidate = randomInt(0, cellCount - 1)
        guard++
      }

      if (isNearEdgeCell(candidate, columns, rows) && !cluster.includes(candidate)) {
        cluster.push(candidate)
        continue
      }
    }

    // Expand from a random seed cell, keeping to near-edge neighbours
    const seed = cluster[randomInt(0, cluster.length - 1)]
    const neighbours = getNeighbours(seed, columns, rows).filter(
      (n) => isNearEdgeCell(n, columns, rows) && !cluster.includes(n),
    )

    if (!neighbours.length) {
      // As a fallback, try to place a random unused near-edge cell.
      let fallback = randomInt(0, cellCount - 1)
      let guard = 0
      while (
        (cluster.includes(fallback) || !isNearEdgeCell(fallback, columns, rows)) &&
        guard < 100
      ) {
        fallback = randomInt(0, cellCount - 1)
        guard++
      }
      if (!cluster.includes(fallback) && isNearEdgeCell(fallback, columns, rows)) {
        cluster.push(fallback)
      } else {
        break // give up if we can't find any more cells to add
      }
      continue
    }

    const next = neighbours[randomInt(0, neighbours.length - 1)]
    cluster.push(next)
  }

  return cluster
}
