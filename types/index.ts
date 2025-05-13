/**
 * Type definitions for the portfolio application
 */

/**
 * Type for block positioning and styling
 */
export type BlockStyle = {
  top: string
  left: string
  width: number
  scale: number
  zIndex: number
  rotateX: number
  rotateY: number
  rotateZ: number
  bg: string
  fontFamily: string
}

/**
 * Type for wireframe positioning and properties
 */
export type WireframeStyle = {
  top: string
  left: string
  width: string
  height: string
  scale: number
  type: 'cube' | 'sphere' | null
  segments?: number
  wireframeColor: number
}

/**
 * Type for Leva control values
 * This interface must match the structure returned by the Leva useControls hook
 */
export interface ControlValues {
  // Animation controls
  isPaused: boolean
  regenerateInterval: number
  regenerateAll?: () => void
  
  // Wireframe controls
  glitchIntensity: number
  wireframeType: 'none' | 'cube' | 'sphere'
  wireframeSegments: number
  wireframeColor: string
  randomizeWireframe?: () => void
  
  // Block controls
  blockCount: number
  glitchProbability: number
  regenerateCount: number
  blockPositionRange: { min: number; max: number }
  blockScaleRange: { min: number; max: number }
  blockWidthRange: { min: number; max: number }
  blockDistributionFactor: number
  enableRotation: boolean
  pixelFontProbability: number
  regenerateAllPositions?: () => void
}