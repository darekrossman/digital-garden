'use client'

import { Box } from '@/styled-system/jsx'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

// Simple terrain mesh that renders a wireframe plane whose vertices are displaced
// by a deterministic height function. This creates a low-poly grid of contour-like
// lines. We keep the implementation intentionally minimal so we can iterate on it
// later.
function Terrain({ text }: { text: string }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const textureRef = useRef<THREE.CanvasTexture>(null)

  // Create text texture
  const createTextTexture = (content: string) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    // High resolution for crisp text
    canvas.width = 2048
    canvas.height = 2048

    // Fill with base terrain color (darker so text contrast works with lighting)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Configure text (lighter color that will be lit)
    ctx.fillStyle = '#000000'
    ctx.font = '40px monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    // Word wrap and render text
    const words = content.split(' ')
    const lineHeight = 40
    const maxWidth = canvas.width - 200
    let line = ''
    let y = 100
    let x = 100

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y)
        line = words[n] + ' '
        y += lineHeight

        // Reset to top with offset when reaching bottom
        if (y > canvas.height - 200) {
          break // Stop when reaching bottom to avoid overflow
        }
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, y)

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.repeat.set(1, 1) // Single instance of text across the surface
    texture.flipY = false // Fix upside-down text

    return texture
  }

  // Initialize texture
  const textTexture = useMemo(() => {
    const texture = createTextTexture(text)
    textureRef.current = texture
    return texture
  }, [])

  // Update texture when text changes
  useEffect(() => {
    if (textureRef.current) {
      textureRef.current.dispose()
    }
    const newTexture = createTextTexture(text)
    textureRef.current = newTexture

    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.map = newTexture
      material.needsUpdate = true
    }
  }, [text])

  // Generate geometry once. We use a small deterministic height function for now –
  // we can replace it with Perlin/simplex noise later.
  const geometry = useMemo(() => {
    const size = 5 // width & height of the plane in world units
    const segments = 10 // fewer subdivisions for chunkier, low-poly faces
    const geom = new THREE.PlaneGeometry(2, 10, 2, 10)

    // Rotate so the plane lies flat with normals facing up (+Y)
    geom.rotateX(Math.PI / 2)

    const pos = geom.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      // Introduce jaggedness by assigning a random height to each vertex.
      // Using Math.random() here is fine because geometry is created once.
      const y = (Math.random() - 0.5) * 1.5 // amplitude controls height variation
      pos.setY(i, y)
    }
    pos.needsUpdate = true
    geom.computeVertexNormals()

    return geom
  }, [])

  // Slowly rotate the mesh to add subtle motion.
  useFrame(({ clock }) => {
    if (meshRef.current) {
      // meshRef.current.rotation.y = clock.getElapsedTime() * 0.02
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow>
      {/* Flat-shaded standard material so lighting reveals the jagged contours */}
      <meshStandardMaterial
        color="#FFFFFF"
        transparent
        flatShading
        side={THREE.DoubleSide}
        map={textTexture}
        emissive="#FF0000"
        emissiveIntensity={0.5}
        emissiveMap={textTexture}
      />
    </mesh>
  )
}

interface ProceduralProps {
  text?: string
}

export const Procedural = ({ text = 'No content provided' }: ProceduralProps) => {
  return (
    <Box w="full" h="full" position="relative">
      <Canvas
        dpr={[2, 2]}
        camera={{ position: [0, 10, 0], fov: 55 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Ambient light for base illumination plus a key directional light to accentuate contours */}
        {/* <ambientLight intensity={1} /> */}
        <directionalLight position={[0, 5, 0]} intensity={3} castShadow color="white" />
        {/* <directionalLight position={[0, 4, -5]} intensity={10} color="#FFFFFF" /> */}

        <Terrain text={text} />
      </Canvas>
    </Box>
  )
}
