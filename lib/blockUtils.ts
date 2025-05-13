import { BlockStyle, ControlValues, WireframeStyle } from '@/types'
import { getRandomInt } from './helpers'

/**
 * Generates a random style for a block based on control values
 */
export function generateRandomBlockStyle(controls: Partial<ControlValues>): BlockStyle {
  // Extract control values with defaults for robustness
  const blockPosRange = controls.blockPositionRange || { min: -10, max: 75 }
  const blockScale = controls.blockScaleRange || { min: 0.5, max: 2.8 }
  const blockDistFactor = controls.blockDistributionFactor ?? 4
  const enableRot = controls.enableRotation ?? false
  const blockWidth = controls.blockWidthRange || { min: 20, max: 40 }
  const pixelFontProb = controls.pixelFontProbability ?? 0.1

  return {
    top: `${getRandomInt(blockPosRange.min, blockPosRange.max)}%`,
    left: `${getRandomInt(blockPosRange.min, blockPosRange.max)}%`,
    scale:
      getRandomInt(Math.floor(blockScale.min * 100), Math.floor(blockScale.max * 100), {
        distribution: 'power',
        factor: blockDistFactor,
      }) / 100,
    zIndex: getRandomInt(0, 9, { distribution: 'power', factor: 2 }),
    rotateX: enableRot ? getRandomInt(-15, 15) : 0,
    rotateY: enableRot ? getRandomInt(-15, 15) : 0,
    rotateZ: enableRot && Math.random() < 0.1 ? 90 : 0,
    width: getRandomInt(blockWidth.min, blockWidth.max),
    bg: 'transparent',
    fontFamily: Math.random() < pixelFontProb ? 'pixel' : 'sans-serif',
  }
}

/**
 * Generates a random wireframe style
 */
export function generateRandomWireframeStyle(): WireframeStyle {
  const top = `${getRandomInt(-15, 75)}%`
  const left = `${getRandomInt(-5, 75)}%`
  const size = `${getRandomInt(50, 250)}px`
  const type = Math.random() < 0.5 ? 'cube' : Math.random() < 0.5 ? 'sphere' : null
  const scale = getRandomInt(80, 150) / 100
  const segments = 12

  // Colors for wireframes
  const colors = [
    0xff0000, // Red
    0x00ff00, // Green
    0x0000ff, // Blue
    0xffff00, // Yellow
    0xff00ff, // Magenta
    0x00ffff, // Cyan
    0xff8000, // Orange
    0x8000ff, // Purple
    0x0080ff, // Light Blue
    0x8fff00, // Lime
    0xff0080, // Hot Pink
    0x000000, // Black
    0xffffff, // White
  ]

  const wireframeColor = colors[getRandomInt(0, colors.length - 1)]

  return {
    top,
    left,
    width: size,
    height: size,
    scale,
    type,
    segments,
    wireframeColor,
  }
}

/**
 * Regenerates specified number of blocks and returns a new Set of indices
 */
export function regenerateBlocks(
  current: Set<number>,
  count: number,
  blockCount: number
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
  count: number, 
  generator: () => BlockStyle
): BlockStyle[] {
  const styles: BlockStyle[] = []
  for (let i = 0; i < count; i++) {
    styles.push(generator())
  }
  return styles
}