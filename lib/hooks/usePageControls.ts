'use client'

import { ControlValues } from '@/types'
import { button, useControls as useLevaControls } from 'leva'
import { useCallback } from 'react'
import { getDefaultControlValues, DEFAULT_CONFIG } from '../config'

/**
 * Props for the usePageControls hook
 */
interface UsePageControlsProps {
  // Callbacks
  onRegenerateAll?: () => void
  onRandomizeWireframe?: () => void
  onRegeneratePositions?: () => void
  
  // Optional overrides for the default values
  initialValues?: Partial<ControlValues>
}

/**
 * Custom hook for managing Leva control panel settings
 * Uses centralized config for defaults
 */
export function usePageControls({
  onRegenerateAll,
  onRandomizeWireframe,
  onRegeneratePositions,
  initialValues = {},
}: UsePageControlsProps): ControlValues {
  // Get default values from our config
  const defaults = getDefaultControlValues()
  
  // Merge with any provided initial values
  const mergedValues = { ...defaults, ...initialValues }
  
  // Convert wireframe color to hex string for Leva if it's a number
  const colorString = typeof mergedValues.wireframeColor === 'number' 
    ? '#' + (mergedValues.wireframeColor || 0).toString(16).padStart(6, '0')
    : mergedValues.wireframeColor

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
      value: mergedValues.isPaused,
      label: 'Pause Animation',
    },
    regenerateInterval: {
      value: mergedValues.regenerateInterval,
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
      value: mergedValues.glitchIntensity,
      min: 0,
      max: 1,
      step: 0.1,
      label: 'Glitch Intensity',
    },
    wireframeType: {
      value: mergedValues.wireframeType === null ? 'none' : mergedValues.wireframeType || 'none',
      options: ['none', 'cube', 'sphere'],
      label: 'Wireframe Type',
    },
    wireframeSegments: {
      value: mergedValues.wireframeSegments,
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
      value: mergedValues.blockCount,
      min: 1,
      max: 20,
      step: 1,
      disabled: true,
      label: 'Block Count',
    },
    glitchProbability: {
      value: mergedValues.glitchProbability,
      min: 0,
      max: 0.5,
      step: 0.01,
      label: 'Glitch Probability',
    },
    regenerateCount: {
      value: mergedValues.regenerateCount,
      min: 1,
      max: 5,
      step: 1,
      label: 'Blocks to Regenerate',
    },
    blockPositionRange: {
      value: mergedValues.blockPositionRange,
      label: 'Position Range (%)',
    },
    blockScaleRange: {
      value: mergedValues.blockScaleRange,
      label: 'Scale Range',
    },
    blockWidthRange: {
      value: mergedValues.blockWidthRange,
      label: 'Width Range (vw)',
    },
    blockDistributionFactor: {
      value: mergedValues.blockDistributionFactor,
      min: 1,
      max: 10,
      step: 0.5,
      label: 'Distribution Factor',
    },
    enableRotation: {
      value: mergedValues.enableRotation,
      label: 'Enable 3D Rotation',
    },
    pixelFontProbability: {
      value: mergedValues.pixelFontProbability,
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
    isPaused: typeof animationControls.isPaused === 'boolean' 
      ? animationControls.isPaused 
      : DEFAULT_CONFIG.isPaused,
    regenerateInterval: typeof animationControls.regenerateInterval === 'number'
      ? animationControls.regenerateInterval
      : DEFAULT_CONFIG.regenerateInterval,
    regenerateAll: handleRegenerateAll,

    // Wireframe controls
    glitchIntensity: typeof wireframeControls.glitchIntensity === 'number'
      ? wireframeControls.glitchIntensity
      : DEFAULT_CONFIG.wireframe.glitchIntensity,
    wireframeType: (wireframeControls.wireframeType as 'none' | 'cube' | 'sphere') || DEFAULT_CONFIG.wireframe.type,
    wireframeSegments: typeof wireframeControls.wireframeSegments === 'number'
      ? wireframeControls.wireframeSegments
      : DEFAULT_CONFIG.wireframe.segments,
    wireframeColor: typeof wireframeControls.wireframeColor === 'string'
      ? wireframeControls.wireframeColor
      : DEFAULT_CONFIG.wireframe.wireframeColor,
    randomizeWireframe: handleRandomizeWireframe,

    // Block controls
    blockCount: typeof blockControls.blockCount === 'number' 
      ? blockControls.blockCount 
      : DEFAULT_CONFIG.blocks.count,
    glitchProbability: typeof blockControls.glitchProbability === 'number' 
      ? blockControls.glitchProbability 
      : DEFAULT_CONFIG.blocks.glitchProbability,
    regenerateCount: typeof blockControls.regenerateCount === 'number' 
      ? blockControls.regenerateCount 
      : DEFAULT_CONFIG.blocks.regenerateCount,
    blockPositionRange: blockControls.blockPositionRange || DEFAULT_CONFIG.blocks.positionRange,
    blockScaleRange: blockControls.blockScaleRange || DEFAULT_CONFIG.blocks.scaleRange,
    blockWidthRange: blockControls.blockWidthRange || DEFAULT_CONFIG.blocks.widthRange,
    blockDistributionFactor: typeof blockControls.blockDistributionFactor === 'number'
      ? blockControls.blockDistributionFactor
      : DEFAULT_CONFIG.blocks.distributionFactor,
    enableRotation: typeof blockControls.enableRotation === 'boolean' 
      ? blockControls.enableRotation 
      : DEFAULT_CONFIG.blocks.enableRotation,
    pixelFontProbability: typeof blockControls.pixelFontProbability === 'number'
      ? blockControls.pixelFontProbability
      : DEFAULT_CONFIG.blocks.pixelFontProbability,
    regenerateAllPositions: handleRegeneratePositions,
  }

  return safeControls
}
