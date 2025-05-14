'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface CubeProps {
  wireframeColor?: number | string
  faceColor?: number | string
  faceOpacity?: number
  glitchIntensity?: number // New prop to control glitch intensity (0-1)
}

export default function Cube({
  wireframeColor = 0x000000,
  faceColor = 0xffffff,
  faceOpacity = 0.1,
  glitchIntensity = 0.5, // Default glitch intensity
}: CubeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cubeRef = useRef<THREE.Mesh | null>(null)
  const wireframeRef = useRef<THREE.LineSegments | null>(null)
  const frameRef = useRef<number | null>(null)
  const isFrozenRef = useRef<boolean>(false)
  const freezeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize scene, camera, and renderer
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(window.devicePixelRatio)

    // Clear any existing canvases in the container first
    if (containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild)
      }
    }

    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.z = 2.5
    cameraRef.current = camera

    // Create cube geometry and materials
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)

    // Material for faces - transparent with slight opacity
    const material = new THREE.MeshBasicMaterial({
      color: faceColor,
      transparent: true,
      opacity: faceOpacity,
      side: THREE.DoubleSide,
    })

    // Create cube with transparent faces
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)
    cubeRef.current = cube

    // Create wireframe
    const edges = new THREE.EdgesGeometry(geometry)
    const lineMaterial = new THREE.LineBasicMaterial({ color: wireframeColor })
    const wireframe = new THREE.LineSegments(edges, lineMaterial)
    cube.add(wireframe)
    wireframeRef.current = wireframe

    // Random rotation velocities
    const rotationVelocity = {
      x: (Math.random() - 0.5) * 0.01,
      y: (Math.random() - 0.5) * 0.01,
      z: (Math.random() - 0.5) * 0.01,
    }

    // Original position
    const originalPosition = {
      x: cube.position.x,
      y: cube.position.y,
      z: cube.position.z,
    }

    // Function to update rotation velocity
    const updateRotationVelocity = () => {
      // Small chance to change rotation velocity each frame
      if (Math.random() < 0.01) {
        rotationVelocity.x = (Math.random() - 0.5) * 0.01
      }
      if (Math.random() < 0.01) {
        rotationVelocity.y = (Math.random() - 0.5) * 0.01
      }
      if (Math.random() < 0.01) {
        rotationVelocity.z = (Math.random() - 0.5) * 0.01
      }
    }

    // Function to apply glitch effects
    const applyGlitchEffects = () => {
      if (!cube || !wireframe) return

      // Skip glitch effects if intensity is 0
      if (glitchIntensity === 0) return

      // 1. Random blinking effect (based on glitch intensity)
      if (Math.random() < 0.03 * glitchIntensity) {
        wireframe.visible = !wireframe.visible
        // Restore visibility after a short time
        setTimeout(
          () => {
            if (wireframe) wireframe.visible = true
          },
          Math.random() * 150 + 50,
        )
      }

      // 2. Random position jumps (based on glitch intensity)
      if (Math.random() < 0.02 * glitchIntensity) {
        // Apply a small random offset
        cube.position.x = originalPosition.x + (Math.random() - 0.5) * 0.1 * glitchIntensity
        cube.position.y = originalPosition.y + (Math.random() - 0.5) * 0.1 * glitchIntensity

        // Reset position after a short delay
        setTimeout(
          () => {
            if (cube) {
              cube.position.x = originalPosition.x
              cube.position.y = originalPosition.y
            }
          },
          Math.random() * 200 + 50,
        )
      }

      // 3. Occasional animation freeze (based on glitch intensity)
      if (Math.random() < 0.005 * glitchIntensity && !isFrozenRef.current) {
        isFrozenRef.current = true

        // Unfreeze after a random time
        const freezeDuration = Math.random() * 500 + 100
        freezeTimerRef.current = window.setTimeout(() => {
          isFrozenRef.current = false
        }, freezeDuration)
      }
    }

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)

      // Apply glitch effects each frame
      applyGlitchEffects()

      if (cube && !isFrozenRef.current) {
        // Update cube rotation
        cube.rotation.x += rotationVelocity.x
        cube.rotation.y += rotationVelocity.y
        cube.rotation.z += rotationVelocity.z

        // Occasionally change rotation velocity
        updateRotationVelocity()
      }

      renderer.render(scene, camera)
    }

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      // Update camera
      camera.aspect = width / height
      camera.updateProjectionMatrix()

      // Update renderer
      renderer.setSize(width, height)
    }

    // Set initial size
    handleResize()

    // Add resize listener
    window.addEventListener('resize', handleResize)

    // Start animation
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }

      if (freezeTimerRef.current) {
        clearTimeout(freezeTimerRef.current)
      }

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }

      // Dispose of geometry and materials
      if (cubeRef.current) {
        cubeRef.current.geometry.dispose()
        if (Array.isArray(cubeRef.current.material)) {
          cubeRef.current.material.forEach((material) => material.dispose())
        } else {
          cubeRef.current.material.dispose()
        }
      }
    }
  }, [wireframeColor, faceColor, faceOpacity, glitchIntensity])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
