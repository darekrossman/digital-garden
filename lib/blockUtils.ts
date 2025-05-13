import { BlockStyle, ControlValues } from '@/types'
import { DEFAULT_CONFIG } from './config'
import { getRandomInt } from './helpers'
import { generateRandomWireframeStyle } from './wireframeUtils'

/**
 * Generates a random style for a block based on control values
 */
export function generateRandomBlockStyle(controls: Partial<ControlValues> = {}): BlockStyle {
  // Extract control values with defaults from central config
  const blockPosRange = controls.blockPositionRange || DEFAULT_CONFIG.blocks.positionRange
  const blockScale = controls.blockScaleRange || DEFAULT_CONFIG.blocks.scaleRange
  const blockDistFactor =
    controls.blockDistributionFactor ?? DEFAULT_CONFIG.blocks.distributionFactor
  const enableRot = controls.enableRotation ?? DEFAULT_CONFIG.blocks.enableRotation
  const blockWidth = controls.blockWidthRange || DEFAULT_CONFIG.blocks.widthRange
  const pixelFontProb = controls.pixelFontProbability ?? DEFAULT_CONFIG.blocks.pixelFontProbability

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
    rotateZ: enableRot && Math.random() < 0.1 ? 90 : 0,
    width: getRandomInt(blockWidth.min, blockWidth.max),
    bg: 'transparent',
    fontFamily: Math.random() < pixelFontProb ? 'pixel' : 'sans-serif',
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
  count: number = DEFAULT_CONFIG.blocks.count,
  generator: () => BlockStyle = () => generateRandomBlockStyle(),
): BlockStyle[] {
  const styles: BlockStyle[] = []
  for (let i = 0; i < count; i++) {
    styles.push(generator())
  }
  return styles
}
