import { BlockStyle, ControlValues, WireframeStyle } from '../types'

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
  regenerateInterval: 3000,

  // Wireframe
  wireframe: {
    type: 'cube' as const,
    segments: 10,
    glitchIntensity: 0.25,
    wireframeColor: '#ffffff',
    colors: WIREFRAME_COLORS, // Available colors for random selection
    positionRanges: {
      top: [-15, 75],
      left: [-5, 75],
      size: [50, 250],
      scale: [80, 150],
    },
    typeWeights: { cube: 0.33, sphere: 0.33, none: 0.34 }, // Default weights for types
  },

  // Blocks
  blocks: {
    count: 8,
    glitchProbability: 0.1,
    regenerateCount: 1,
    positionRange: { min: -10, max: 80 },
    scaleRange: { min: 0.5, max: 2.6 },
    widthRange: { min: 20, max: 40 },
    distributionFactor: 1.2,
    enableRotation: true,
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

/**
 * Get default control values
 */
export const getDefaultControlValues = (): ControlValues => {
  return {
    isPaused: DEFAULT_CONFIG.isPaused,
    regenerateInterval: DEFAULT_CONFIG.regenerateInterval,
    wireframeType: DEFAULT_CONFIG.wireframe.type,
    wireframeSegments: DEFAULT_CONFIG.wireframe.segments,
    wireframeColor: DEFAULT_CONFIG.wireframe.wireframeColor,
    glitchIntensity: DEFAULT_CONFIG.wireframe.glitchIntensity,
    blockCount: DEFAULT_CONFIG.blocks.count,
    glitchProbability: DEFAULT_CONFIG.blocks.glitchProbability,
    regenerateCount: DEFAULT_CONFIG.blocks.regenerateCount,
    blockPositionRange: DEFAULT_CONFIG.blocks.positionRange,
    blockScaleRange: DEFAULT_CONFIG.blocks.scaleRange,
    blockWidthRange: DEFAULT_CONFIG.blocks.widthRange,
    blockDistributionFactor: DEFAULT_CONFIG.blocks.distributionFactor,
    enableRotation: DEFAULT_CONFIG.blocks.enableRotation,
    pixelFontProbability: DEFAULT_CONFIG.blocks.pixelFontProbability,
    // These functions will be replaced by actual implementations
    regenerateAll: () => {},
    randomizeWireframe: () => {},
    regenerateAllPositions: () => {},
  }
}
