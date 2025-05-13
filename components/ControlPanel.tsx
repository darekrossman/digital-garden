'use client'

import { ControlValues } from '@/types'
import { Leva } from 'leva'
import { usePageControls } from '@/lib/hooks/usePageControls'
import { useEffect, useState } from 'react'

interface ControlPanelProps {
  blockCount: number
  initialGlitchIntensity?: number
  initialWireframeColor?: number
  initialWireframeType?: 'cube' | 'sphere' | null
  initialWireframeSegments?: number
  onGlitchIntensityChange?: (value: number) => void
  onWireframeTypeChange?: (type: 'cube' | 'sphere' | null) => void
  onWireframeSegmentsChange?: (segments: number) => void
  onWireframeColorChange?: (color: number) => void
  onRegenerateAll?: () => void
  onRandomizeWireframe?: () => void
  onRegeneratePositions?: () => void
}

/**
 * Control panel component using Leva for UI settings
 */
export default function ControlPanel({
  blockCount,
  initialGlitchIntensity = 0.5,
  initialWireframeColor = 0x000000,
  initialWireframeType = null,
  initialWireframeSegments = 12,
  onGlitchIntensityChange,
  onWireframeTypeChange,
  onWireframeSegmentsChange,
  onWireframeColorChange,
  onRegenerateAll,
  onRandomizeWireframe,
  onRegeneratePositions,
}: ControlPanelProps) {
  // Track previous values to detect changes
  const [prevGlitchIntensity, setPrevGlitchIntensity] = useState<number>(initialGlitchIntensity || 0.5)
  const [prevWireframeType, setPrevWireframeType] = useState<'cube' | 'sphere' | null>(initialWireframeType)
  const [prevWireframeSegments, setPrevWireframeSegments] = useState<number>(initialWireframeSegments || 12)
  const [prevWireframeColor, setPrevWireframeColor] = useState<number>(initialWireframeColor || 0)

  // Get control values from the custom hook
  const controls = usePageControls({
    blockCount,
    initialGlitchIntensity,
    initialWireframeColor,
    initialWireframeType,
    initialWireframeSegments,
    onRegenerateAll,
    onRandomizeWireframe,
    onRegeneratePositions,
  })

  // Use effect to detect and handle control value changes
  useEffect(() => {
    // Handle glitch intensity change
    if (onGlitchIntensityChange && 
        typeof controls.glitchIntensity === 'number' && 
        controls.glitchIntensity !== prevGlitchIntensity) {
      onGlitchIntensityChange(controls.glitchIntensity)
      setPrevGlitchIntensity(controls.glitchIntensity)
    }

    // Handle wireframe type change
    if (onWireframeTypeChange && controls.wireframeType) {
      const selectedType = controls.wireframeType === 'none' ? null : controls.wireframeType as 'cube' | 'sphere'
      if (selectedType !== prevWireframeType) {
        onWireframeTypeChange(selectedType)
        setPrevWireframeType(selectedType)
      }
    }

    // Handle wireframe segments change
    if (onWireframeSegmentsChange && 
        typeof controls.wireframeSegments === 'number' && 
        controls.wireframeSegments !== prevWireframeSegments) {
      onWireframeSegmentsChange(controls.wireframeSegments)
      setPrevWireframeSegments(controls.wireframeSegments)
    }

    // Handle wireframe color change
    if (onWireframeColorChange && controls.wireframeColor) {
      const colorHex = controls.wireframeColor
      
      // Make sure colorHex is a valid string before trying to replace
      if (typeof colorHex === 'string' && colorHex.startsWith('#')) {
        const colorNumber = parseInt(colorHex.replace('#', ''), 16)
        
        if (!isNaN(colorNumber) && colorNumber !== prevWireframeColor) {
          onWireframeColorChange(colorNumber)
          setPrevWireframeColor(colorNumber)
        }
      }
    }
  }, [
    controls,
    prevGlitchIntensity,
    prevWireframeType,
    prevWireframeSegments,
    prevWireframeColor,
    onGlitchIntensityChange,
    onWireframeTypeChange,
    onWireframeSegmentsChange,
    onWireframeColorChange,
  ])

  return (
    <Leva 
      oneLineLabels 
      theme={{ colors: { accent1: '#000' } }} 
      titleBar={{ title: 'Portfolio Controls' }}
    />
  )
}