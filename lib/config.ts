import { wireframeColors } from './constants'

export const defaultConfig = {
  isPaused: false,
  regenerateInterval: 5000,

  // Wireframe
  wireframe: {
    type: null,
    segments: 10,
    glitchIntensity: 0,
    wireframeColor: '#ffffff',
    colors: wireframeColors, // Available colors for random selection
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
    count: 4,
    regenerateCount: 1,
    positionRange: { min: -10, max: 90 },
    scaleRange: { min: 0.6, max: 4.6 },
    widthRange: { min: 10, max: 60 },
    distributionFactor: 3,
    rotateZProbability: 0.15,
  },
}
