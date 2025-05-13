import { WireframeStyle } from '@/types'
import { getRandomInt } from './helpers'

/**
 * Predefined colors for wireframe objects
 */
export const wireframeColors = [
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
  0x000000, // Black (occasionally)
  0xffffff, // White (occasionally)
]

/**
 * Generates a random wireframe style with configurable properties
 */
export function generateRandomWireframeStyle(
  options: {
    topRange?: [number, number]
    leftRange?: [number, number]
    sizeRange?: [number, number]
    typeWeights?: { cube: number; sphere: number; none: number }
    scaleRange?: [number, number]
    colorOptions?: number[]
  } = {}
): WireframeStyle {
  // Use provided options or defaults
  const topRange = options.topRange || [-15, 75]
  const leftRange = options.leftRange || [-5, 75]
  const sizeRange = options.sizeRange || [50, 250]
  const scaleRange = options.scaleRange || [80, 150]
  const colorOptions = options.colorOptions || wireframeColors
  
  // Type selection based on weights or default 33/33/33 distribution
  const typeWeights = options.typeWeights || { cube: 0.33, sphere: 0.33, none: 0.34 }
  
  // Generate random position
  const top = `${getRandomInt(topRange[0], topRange[1])}%`
  const left = `${getRandomInt(leftRange[0], leftRange[1])}%`
  
  // Generate random size (same for width and height to maintain aspect ratio)
  const size = `${getRandomInt(sizeRange[0], sizeRange[1])}px`
  
  // Determine wireframe type based on weights
  const random = Math.random()
  let type: 'cube' | 'sphere' | null
  
  if (random < typeWeights.cube) {
    type = 'cube'
  } else if (random < typeWeights.cube + typeWeights.sphere) {
    type = 'sphere'
  } else {
    type = null
  }
  
  // Generate random scale
  const scale = getRandomInt(scaleRange[0], scaleRange[1]) / 100
  
  // Default segments (could be made configurable in the future)
  const segments = 12
  
  // Pick a random color from the available options
  const wireframeColor = colorOptions[getRandomInt(0, colorOptions.length - 1)]

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
 * Converts a hex color string to a number
 */
export function hexToNumber(hexColor: string): number {
  return parseInt(hexColor.replace('#', ''), 16)
}

/**
 * Converts a color number to hex string
 */
export function numberToHex(colorNumber: number): string {
  return '#' + colorNumber.toString(16).padStart(6, '0')
}

/**
 * Creates a style object for positioning wireframe components
 */
export function getWireframePositionStyle(wireframeStyle: WireframeStyle): React.CSSProperties {
  return {
    top: wireframeStyle.top,
    left: wireframeStyle.left,
    width: wireframeStyle.width,
    height: wireframeStyle.height,
  }
}