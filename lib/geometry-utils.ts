import { WireframeStyle } from '@/types'
import { defaultConfig } from './config'
import { getRandomInt } from './helpers'

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
  } = {},
): WireframeStyle {
  // Use provided options or defaults from config
  const topRange = options.topRange || defaultConfig.wireframe.positionRanges.top
  const leftRange = options.leftRange || defaultConfig.wireframe.positionRanges.left
  const sizeRange = options.sizeRange || defaultConfig.wireframe.positionRanges.size
  const scaleRange = options.scaleRange || defaultConfig.wireframe.positionRanges.scale
  const colorOptions = options.colorOptions || defaultConfig.wireframe.colors

  // Type selection based on weights or default distribution from config
  const typeWeights = options.typeWeights || defaultConfig.wireframe.typeWeights

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

  // Use segments from central config
  const segments = defaultConfig.wireframe.segments

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
  // Handle both formats: "#ffffff" and "ffffff"
  const hex = hexColor.startsWith('#') ? hexColor.substring(1) : hexColor
  return parseInt(hex, 16)
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
