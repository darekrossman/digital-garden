'use client'

import { ControlValues } from '@/types'
import { button, folder, useControls as useLevaControls } from 'leva'
import { useCallback } from 'react'

/**
 * Props for the usePageControls hook
 */
interface UsePageControlsProps {
  blockCount: number
  initialGlitchIntensity?: number
  initialWireframeColor?: number
  initialWireframeType?: 'cube' | 'sphere' | null
  initialWireframeSegments?: number
  onRegenerateAll?: () => void
  onRandomizeWireframe?: () => void
  onRegeneratePositions?: () => void
}

/**
 * Custom hook for managing Leva control panel settings
 */
export function usePageControls({
  blockCount,
  initialGlitchIntensity = 0.5,
  initialWireframeColor = 0x000000,
  initialWireframeType = null,
  initialWireframeSegments = 12,
  onRegenerateAll,
  onRandomizeWireframe,
  onRegeneratePositions,
}: UsePageControlsProps): ControlValues {
  // Convert initial wireframe color to hex string for Leva
  // Ensure it's a valid hex color with padding to 6 digits
  const colorString = '#' + (initialWireframeColor || 0).toString(16).padStart(6, '0')
  
  // Create callback handlers for buttons
  const handleRegenerateAll = useCallback(() => {
    if (onRegenerateAll) onRegenerateAll()
  }, [onRegenerateAll])
  
  const handleRandomizeWireframe = useCallback(() => {
    if (onRandomizeWireframe) onRandomizeWireframe()
  }, [onRandomizeWireframe])
  
  const handleRegeneratePositions = useCallback(() => {
    if (onRegeneratePositions) onRegeneratePositions()
  }, [onRegeneratePositions])
  
  // Animation controls
  const animationControls = useLevaControls('animation', {
    isPaused: {
      value: false,
      label: 'Pause Animation',
    },
    regenerateInterval: {
      value: 10000,
      min: 1000,
      max: 30000,
      step: 500,
      label: 'Regen Interval (ms)',
    },
    regenerateAll: button(handleRegenerateAll),
  })
  
  // Wireframe controls
  const wireframeControls = useLevaControls('wireframe', {
    glitchIntensity: {
      value: initialGlitchIntensity || 0.5,
      min: 0,
      max: 1,
      step: 0.1,
      label: 'Glitch Intensity',
    },
    wireframeType: {
      value: initialWireframeType === null ? 'none' : (initialWireframeType as string) || 'none',
      options: ['none', 'cube', 'sphere'],
      label: 'Wireframe Type',
    },
    wireframeSegments: {
      value: initialWireframeSegments || 12,
      min: 4,
      max: 32,
      step: 1,
      label: 'Segments',
    },
    wireframeColor: {
      value: colorString,
      label: 'Color',
    },
    randomizeWireframe: button(handleRandomizeWireframe),
  })
  
  // Block controls
  const blockControls = useLevaControls('blocks', {
    blockCount: {
      value: blockCount || 9,
      min: 1,
      max: 20,
      step: 1,
      disabled: true,
      label: 'Block Count',
    },
    glitchProbability: {
      value: 0.05,
      min: 0,
      max: 0.5,
      step: 0.01,
      label: 'Glitch Probability',
    },
    regenerateCount: {
      value: 2,
      min: 1,
      max: 5,
      step: 1,
      label: 'Blocks to Regenerate',
    },
    blockPositionRange: {
      value: { min: -10, max: 75 },
      label: 'Position Range (%)',
    },
    blockScaleRange: {
      value: { min: 0.5, max: 2.8 },
      label: 'Scale Range',
    },
    blockWidthRange: {
      value: { min: 20, max: 40 },
      label: 'Width Range (vw)',
    },
    blockDistributionFactor: {
      value: 4,
      min: 1,
      max: 10,
      step: 0.5,
      label: 'Distribution Factor',
    },
    enableRotation: {
      value: false,
      label: 'Enable 3D Rotation',
    },
    pixelFontProbability: {
      value: 0.1,
      min: 0,
      max: 1,
      step: 0.05,
      label: 'Pixel Font Probability',
    },
    regenerateAllPositions: button(handleRegeneratePositions),
  })

  // Create a properly typed ControlValues object with our flattened controls
  const safeControls: ControlValues = {
    // Animation controls
    isPaused: typeof animationControls.isPaused === 'boolean' ? animationControls.isPaused : false,
    regenerateInterval: typeof animationControls.regenerateInterval === 'number' ? animationControls.regenerateInterval : 10000,
    regenerateAll: handleRegenerateAll,
    
    // Wireframe controls
    glitchIntensity: typeof wireframeControls.glitchIntensity === 'number' ? wireframeControls.glitchIntensity : 0.5,
    wireframeType: (wireframeControls.wireframeType as 'none' | 'cube' | 'sphere') || 'none',
    wireframeSegments: typeof wireframeControls.wireframeSegments === 'number' ? wireframeControls.wireframeSegments : 12,
    wireframeColor: typeof wireframeControls.wireframeColor === 'string' ? wireframeControls.wireframeColor : colorString,
    randomizeWireframe: handleRandomizeWireframe,
    
    // Block controls
    blockCount: typeof blockControls.blockCount === 'number' ? blockControls.blockCount : blockCount,
    glitchProbability: typeof blockControls.glitchProbability === 'number' ? blockControls.glitchProbability : 0.05,
    regenerateCount: typeof blockControls.regenerateCount === 'number' ? blockControls.regenerateCount : 2,
    blockPositionRange: blockControls.blockPositionRange || { min: -10, max: 75 },
    blockScaleRange: blockControls.blockScaleRange || { min: 0.5, max: 2.8 },
    blockWidthRange: blockControls.blockWidthRange || { min: 20, max: 40 },
    blockDistributionFactor: typeof blockControls.blockDistributionFactor === 'number' ? blockControls.blockDistributionFactor : 4,
    enableRotation: typeof blockControls.enableRotation === 'boolean' ? blockControls.enableRotation : false,
    pixelFontProbability: typeof blockControls.pixelFontProbability === 'number' ? blockControls.pixelFontProbability : 0.1,
    regenerateAllPositions: handleRegeneratePositions,
  }
  
  return safeControls
}