import { BlockStyle, WireframeStyle } from '../types'

/**
 * Predefined colors for wireframe objects
 */
export const WIREFRAME_COLORS = [
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

/**
 * Application default configuration
 * This is the single source of truth for all default parameters
 */
export const DEFAULT_CONFIG = {
  // Animation
  isPaused: false,
  regenerateInterval: 6000,

  // Wireframe
  wireframe: {
    type: null,
    segments: 10,
    glitchIntensity: 1,
    wireframeColor: '#ffffff',
    colors: WIREFRAME_COLORS, // Available colors for random selection
    positionRanges: {
      top: [-15, 75],
      left: [-5, 75],
      size: [50, 250],
      scale: [80, 150],
    },
    typeWeights: { cube: 0.1, sphere: 0.1, none: 0.8 }, // Default weights for types
  },

  // Blocks
  blocks: {
    count: 16,
    glitchProbability: 0.04,
    regenerateCount: 6,
    positionRange: { min: -10, max: 90 },
    scaleRange: { min: 0.6, max: 2.6 },
    widthRange: { min: 20, max: 40 },
    distributionFactor: 3,
    rotateZProbability: 0.15,
    pixelFontProbability: 0.3,
  },
}

/**
 * Get default block styles
 */
export const getDefaultBlockStyles = (
  count: number = DEFAULT_CONFIG.blocks.count,
): BlockStyle[] => {
  return Array(count)
    .fill(null)
    .map(() => ({
      top: '0%',
      left: '0%',
      scale: 1,
      width: 30,
      zIndex: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      bg: 'transparent',
      fontFamily:
        Math.random() < DEFAULT_CONFIG.blocks.pixelFontProbability ? 'pixel' : 'sans-serif',
    }))
}

/**
 * Get default wireframe style
 */
export const getDefaultWireframeStyle = (): WireframeStyle => {
  return {
    type: DEFAULT_CONFIG.wireframe.type,
    segments: DEFAULT_CONFIG.wireframe.segments,
    wireframeColor: DEFAULT_CONFIG.wireframe.wireframeColor,
    top: '0%',
    left: '0%',
    width: '50px',
    height: '50px',
    scale: 1,
  }
}
