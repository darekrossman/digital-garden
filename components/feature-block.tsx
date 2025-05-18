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
  const [gap, setGap] = useState(0)
  const intervalRef = useRef<{ clear: () => void; id: NodeJS.Timeout } | null>(null)

  const cellCount = rows * columns

  useEffect(() => {
    // Always clear any existing interval first.
    intervalRef.current?.clear()

    if (isPaused) return // Do not restart interval while paused.

    intervalRef.current = createClearableInterval(() => {
      if (Math.random() < 0.1) {
        setChosenCells((prev) => buildCluster(prev, columns, rows, cellCount))
      }
    }, intervalDuration)

    return () => intervalRef.current?.clear()
  }, [columns, rows, intervalDuration, isPaused])

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
              style={
                {
                  transform: isChosen ? 'scale(0.7)' : 'scale(1)',
                  backgroundColor: isChosen ? 'black' : 'black',
                  borderRadius: isChosen ? '100%' : '0',
                } as React.CSSProperties
              }
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
          <div aria-hidden="true" />
          <styled.p color="yellow" textBoxEdge="cap alphabetic" textBoxTrim="trim-both">
            <Link href="/me">Take me away from here</Link>
          </styled.p>
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
  const targetSize = Math.min(randomInt(8, 12), edgesCount)

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

  // Maintain a frontier of candidate neighbour cells that are adjacent to the current cluster
  let frontier = getNeighbours(startCell, columns, rows).filter(
    (n) => isNearEdgeCell(n, columns, rows) && !cluster.includes(n),
  )

  while (cluster.length < targetSize && frontier.length) {
    // Pick a random frontier cell to add
    const next = frontier[randomInt(0, frontier.length - 1)]
    cluster.push(next)

    // Update frontier: remove the picked cell and add its valid neighbours
    frontier = frontier.filter((n) => n !== next)
    frontier.push(
      ...getNeighbours(next, columns, rows).filter(
        (n) => isNearEdgeCell(n, columns, rows) && !cluster.includes(n),
      ),
    )
    frontier = unique(frontier)
  }

  return cluster
}
