import { regenerateBlocks } from '@/lib/blockUtils'
import { defaultConfig } from '@/lib/config'
import { generateRandomWireframeStyle, getWireframePositionStyle } from '@/lib/geometry-utils'
import { createClearableInterval } from '@/lib/helpers'
import { Box } from '@/styled-system/jsx'
import { WireframeStyle } from '@/types'
import { useEffect, useRef, useState } from 'react'
import Cube from './cube'
import Sphere from './sphere'

export function RandomGeometry({ isPaused }: { isPaused: boolean }) {
  const intervalRef = useRef<ReturnType<typeof createClearableInterval> | null>(null)

  const [wireframeStyle, setWireframeStyle] = useState<WireframeStyle>({
    top: '0',
    left: '0',
    width: '50px',
    height: '50px',
    scale: 1,
    type: defaultConfig.wireframe.type,
    segments: defaultConfig.wireframe.segments,
    wireframeColor: defaultConfig.wireframe.wireframeColor,
  })

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        intervalRef.current.clear()
        intervalRef.current = null
      }
      return
    }

    // If not paused, (re)set up the interval
    if (intervalRef.current) {
      intervalRef.current.clear()
    }

    intervalRef.current = createClearableInterval(() => {
      setWireframeStyle(generateRandomWireframeStyle())
    }, defaultConfig.regenerateInterval)

    return () => {
      if (intervalRef.current) {
        intervalRef.current.clear()
        intervalRef.current = null
      }
    }
  }, [isPaused])

  return (
    <Box position="absolute" style={getWireframePositionStyle(wireframeStyle)} zIndex="-1">
      {wireframeStyle.type === 'cube' && (
        <Cube
          wireframeColor={wireframeStyle.wireframeColor}
          glitchIntensity={defaultConfig.wireframe.glitchIntensity}
        />
      )}

      {wireframeStyle.type === 'sphere' && (
        <Sphere
          widthSegments={wireframeStyle.segments}
          heightSegments={wireframeStyle.segments}
          wireframeColor={wireframeStyle.wireframeColor}
          glitchIntensity={defaultConfig.wireframe.glitchIntensity}
        />
      )}
    </Box>
  )
}
