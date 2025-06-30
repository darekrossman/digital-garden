import { BlockStyle } from '@/types'
import { defaultConfig } from './config'
import { getRandomFontFamily, getRandomInt } from './helpers'

/**
 * Generates a random style for a block based on control values
 */
export function generateRandomBlockStyle(): BlockStyle {
  // Extract control values with defaults from central config
  const blockPosRange = defaultConfig.blocks.positionRange
  const blockScale = defaultConfig.blocks.scaleRange
  const blockDistFactor = defaultConfig.blocks.distributionFactor
  const blockWidth = defaultConfig.blocks.widthRange
  const rotateZProb = defaultConfig.blocks.rotateZProbability

  const colors = ['transprent', 'gray', 'white', 'red', 'blue', 'orange']

  return {
    top: `${getRandomInt(blockPosRange.min, blockPosRange.max)}%`,
    left: `${getRandomInt(blockPosRange.min, blockPosRange.max)}%`,
    scale:
      getRandomInt(Math.floor(blockScale.min * 100), Math.floor(blockScale.max * 100), {
        distribution: 'power',
        factor: blockDistFactor,
      }) / 100,
    zIndex: getRandomInt(0, 9, { distribution: 'power', factor: 2 }),
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    // rotateZ: Math.random() < rotateZProb ? 90 : 0,
    width: getRandomInt(blockWidth.min, blockWidth.max),
    bg: 'transparent',
    fontFamily: getRandomFontFamily({ pixel: 0.1, mono: 0.9 }),
    mixBlendMode: 'difference',
  }
}

/**
 * Regenerates specified number of blocks and returns a new Set of indices
 */
export function regenerateBlocks(
  current: Set<number>,
  count: number,
  blockCount: number,
): Set<number> {
  const newSet = new Set(current)
  let attempts = 0

  while (newSet.size < current.size + count && attempts < 10) {
    const randomIndex = getRandomInt(0, blockCount - 1)
    newSet.add(randomIndex)
    attempts++
  }

  return newSet
}

/**
 * Generates a CSS transform string from block style properties
 */
export function getBlockTransform(style: BlockStyle): string {
  return `scale(${style.scale}) rotateX(${style.rotateX}deg) rotateY(${style.rotateY}deg) rotateZ(${style.rotateZ}deg)`
}

/**
 * Creates an array of random block styles
 */
export function generateInitialBlockStyles(
  count: number = defaultConfig.blocks.count,
  generator: () => BlockStyle = () => generateRandomBlockStyle(),
): BlockStyle[] {
  const styles: BlockStyle[] = []
  for (let i = 0; i < count; i++) {
    styles.push(generator())
  }
  return styles
}
