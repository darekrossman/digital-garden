'use client'

import { css } from '@/styled-system/css'
import { button, folder, useControls } from 'leva'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { WebGLRenderer } from 'three'

// WebGPU support types
declare global {
  interface Navigator {
    gpu?: {
      requestAdapter(): Promise<any>
    }
  }
}

class ParticleSystem {
  private renderer: WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private particles!: THREE.Points
  private numParticles: number
  private positionBuffer: Float32Array
  private velocityBuffer: Float32Array
  private particleMass: Float32Array
  private clock: THREE.Clock
  private canvasHeight: number = 0
  private noise: (x: number, y: number, z: number) => number
  private time: number = 0

  // Debug grid properties
  private showDebugGrid: boolean = false
  private debugGridPoints: THREE.Mesh[] = []
  private debugGridMaterial: THREE.MeshBasicMaterial

  // Fixed Physics parameters
  private attractionStrengthBase: number
  private noiseScale: number
  private noiseStrength: number
  private particleDamping: number
  private maxParticleSpeed: number
  private particleRepulsion: number
  private particleAlignment: number
  private bounceElasticity: number
  private maxRadius: number

  // Target values for smooth transitions
  private targetAttractionStrength: number
  private targetNoiseScale: number
  private targetNoiseStrength: number
  private targetDamping: number
  private targetMaxSpeed: number
  private targetRepulsion: number
  private targetAlignment: number
  private targetBounceElasticity: number
  private targetMaxRadius: number

  // Transition speed (0-1, where 1 is immediate)
  private transitionSpeed: number = 0.05

  constructor(
    canvas: HTMLCanvasElement,
    // Accept geometry parameters
    initialParams: {
      attractionStrength: number
      noiseScale: number
      noiseStrength: number
      damping: number
      maxSpeed: number
      repulsion: number
      alignment: number
      bounceElasticity: number
      maxRadius: number
    },
  ) {
    this.numParticles = 8000
    this.positionBuffer = new Float32Array(this.numParticles * 3)
    this.velocityBuffer = new Float32Array(this.numParticles * 3)
    this.particleMass = new Float32Array(this.numParticles)
    this.canvasHeight = canvas.clientHeight
    this.clock = new THREE.Clock()

    // Initialize physics parameters from constructor
    this.attractionStrengthBase = initialParams.attractionStrength
    this.noiseScale = initialParams.noiseScale
    this.noiseStrength = initialParams.noiseStrength
    this.particleDamping = initialParams.damping
    this.maxParticleSpeed = initialParams.maxSpeed
    this.particleRepulsion = initialParams.repulsion
    this.particleAlignment = initialParams.alignment
    this.bounceElasticity = initialParams.bounceElasticity
    this.maxRadius = initialParams.maxRadius

    // Simple implementation of Perlin-like noise for chaotic movement
    this.noise = (x: number, y: number, z: number) => {
      const X = Math.floor(x) & 255
      const Y = Math.floor(y) & 255
      const Z = Math.floor(z) & 255

      x -= Math.floor(x)
      y -= Math.floor(y)
      z -= Math.floor(z)

      const u = this.fade(x)
      const v = this.fade(y)
      const w = this.fade(z)

      // Using simple hash function rather than full perlin implementation
      const A = (X + Y) % 255
      const AA = (A + Z) % 255
      const AB = (A + Z + 1) % 255
      const B = (X + Y + 1) % 255
      const BA = (B + Z) % 255
      const BB = (B + Z + 1) % 255

      return this.lerp(
        w,
        this.lerp(
          v,
          this.lerp(u, this.grad(AA, x, y, z), this.grad(BA, x - 1, y, z)),
          this.lerp(u, this.grad(AB, x, y - 1, z), this.grad(BB, x - 1, y - 1, z)),
        ),
        this.lerp(
          v,
          this.lerp(u, this.grad(AA + 1, x, y, z - 1), this.grad(BA + 1, x - 1, y, z - 1)),
          this.lerp(u, this.grad(AB + 1, x, y - 1, z - 1), this.grad(BB + 1, x - 1, y - 1, z - 1)),
        ),
      )
    }

    // Scene setup
    this.scene = new THREE.Scene()
    const aspect = canvas.clientWidth / canvas.clientHeight
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 15)
    this.camera.position.z = 6 // Adjusted for the larger canvas

    // Set up renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setClearColor(0x000000, 0) // Fully transparent background

    // Debug Grid Material Setup
    this.debugGridMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })

    // Initialize Debug Grid
    this.initDebugGrid()

    // Set initial camera position (can be overridden by controls later)
    this.camera.position.set(0, 0, 6)

    // Create particles
    this.initParticles()

    // Handle resize
    this.onResize = this.onResize.bind(this)
    window.addEventListener('resize', this.onResize)

    // Initial resize
    this.onResize()

    // Initialize all target values to current values
    this.targetAttractionStrength = this.attractionStrengthBase
    this.targetNoiseScale = this.noiseScale
    this.targetNoiseStrength = this.noiseStrength
    this.targetDamping = this.particleDamping
    this.targetMaxSpeed = this.maxParticleSpeed
    this.targetRepulsion = this.particleRepulsion
    this.targetAlignment = this.particleAlignment
    this.targetBounceElasticity = this.bounceElasticity
    this.targetMaxRadius = this.maxRadius
  }

  // Method to update physics parameters from controls - now just sets targets
  updatePhysicsParams(params: {
    attractionStrength: number
    noiseScale: number
    noiseStrength: number
    damping: number
    maxSpeed: number
    repulsion: number
    alignment: number
    bounceElasticity: number
    maxRadius: number
  }) {
    // Update target values for smooth transitions
    this.targetAttractionStrength = params.attractionStrength
    this.targetNoiseScale = params.noiseScale
    this.targetNoiseStrength = params.noiseStrength
    this.targetDamping = params.damping
    this.targetMaxSpeed = params.maxSpeed
    this.targetRepulsion = params.repulsion
    this.targetAlignment = params.alignment
    this.targetBounceElasticity = params.bounceElasticity
    this.targetMaxRadius = params.maxRadius
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a)
  }

  private grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15
    const u = h < 8 ? x : y
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  private initParticles() {
    // Distribute particles more evenly throughout the scene
    for (let i = 0; i < this.numParticles; i++) {
      const i3 = i * 3

      // Create a more uniform distribution of particles
      const phi = Math.random() * Math.PI * 2
      const theta = Math.random() * Math.PI
      const radius = Math.random() * this.maxRadius * 0.8

      // Use spherical distribution with slight flattening
      this.positionBuffer[i3] = Math.sin(theta) * Math.cos(phi) * radius
      this.positionBuffer[i3 + 1] = (Math.random() * 2 - 1) * 1.6 // y from -1.6 to 1.6
      this.positionBuffer[i3 + 2] = Math.sin(theta) * Math.sin(phi) * radius

      // Set varied initial velocities in all directions
      const speed = 0.01 + Math.random() * 0.02
      const velAngle = Math.random() * Math.PI * 2
      const velElevation = Math.random() * Math.PI - Math.PI / 2

      this.velocityBuffer[i3] = Math.cos(velAngle) * Math.cos(velElevation) * speed
      this.velocityBuffer[i3 + 1] = Math.sin(velElevation) * speed
      this.velocityBuffer[i3 + 2] = Math.sin(velAngle) * Math.cos(velElevation) * speed

      // Assign varying mass to each particle (affects momentum and interactions)
      this.particleMass[i] = 0.2 + Math.random() * 1.8 // Range: 0.2 to 3.0
    }

    // Create particle geometry
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positionBuffer, 3))

    // Create particle material with 1px size
    const material = new THREE.PointsMaterial({
      size: 1,
      sizeAttenuation: false,
      transparent: false,
      color: 0x000000,
      vertexColors: false,
    })

    // Create particle system
    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)

    // Dispose debug grid resources
    this.debugGridMaterial.dispose()
    this.debugGridPoints.forEach((mesh) => {
      mesh.geometry.dispose()
      // Material is shared
      this.scene.remove(mesh)
    })
    this.debugGridPoints = []

    this.renderer.dispose()
  }

  public animate() {
    const deltaTime = Math.min(this.clock.getDelta(), 0.1)
    this.time += deltaTime

    // Apply smooth transitions for parameters
    this.updateTransitions()

    // Update particle positions with individual momentum and interactions
    for (let i = 0; i < this.numParticles; i++) {
      const i3 = i * 3
      const mass = this.particleMass[i]

      // Current position
      const x = this.positionBuffer[i3]
      const y = this.positionBuffer[i3 + 1]
      const z = this.positionBuffer[i3 + 2]

      // 2. Chaotic force using noise field (creates unpredictable currents)
      const noiseX =
        this.noise(x * this.noiseScale, y * this.noiseScale, this.time * 0.2) * this.noiseStrength
      const noiseY =
        this.noise(x * this.noiseScale + 100, y * this.noiseScale, this.time * 0.2) *
        (this.noiseStrength * 0.6)
      const noiseZ =
        this.noise(x * this.noiseScale, y * this.noiseScale + 200, this.time * 0.2) *
        this.noiseStrength

      // Initialize accumulator for neighbor interactions
      let interactionForceX = 0
      let interactionForceY = 0
      let interactionForceZ = 0

      // 3. Particle-to-particle interactions (simplified for performance - only check nearby particles)
      // Calculate interaction with a subset of other particles
      const interactionSamples = 6 // Check only a few other particles for interactions
      for (let j = 0; j < interactionSamples; j++) {
        // Choose a somewhat nearby particle (not fully random)
        const otherIndex = (i + j * (this.numParticles / interactionSamples)) % this.numParticles
        const otherI3 = otherIndex * 3

        // Skip if it's the same particle
        if (otherIndex === i) continue

        // Vector from current to other particle
        const dx = this.positionBuffer[otherI3] - x
        const dy = this.positionBuffer[otherI3 + 1] - y
        const dz = this.positionBuffer[otherI3 + 2] - z

        // Distance (squared) between particles
        const distSq = dx * dx + dy * dy + dz * dz

        if (distSq < 0.04 && distSq > 0.0001) {
          // Short range repulsion (avoid collisions)
          const repulsionStrength = this.particleRepulsion / (distSq * mass)
          interactionForceX -= dx * repulsionStrength
          interactionForceY -= dy * repulsionStrength
          interactionForceZ -= dz * repulsionStrength
        } else if (distSq < 0.16) {
          // Medium range alignment - align velocity with nearby particles
          const alignmentStrength = (this.particleAlignment * deltaTime) / mass
          interactionForceX +=
            (this.velocityBuffer[otherI3] - this.velocityBuffer[i3]) * alignmentStrength
          interactionForceY +=
            (this.velocityBuffer[otherI3 + 1] - this.velocityBuffer[i3 + 1]) * alignmentStrength
          interactionForceZ +=
            (this.velocityBuffer[otherI3 + 2] - this.velocityBuffer[i3 + 2]) * alignmentStrength
        }
      }

      // 4. Small random jitter (scaled by mass - lighter particles jitter more)
      const jitter = 0.0004 / mass
      const jitterX = (Math.random() - 0.5) * jitter
      const jitterY = (Math.random() - 0.5) * jitter
      const jitterZ = (Math.random() - 0.5) * jitter

      // Add all forces to velocity
      this.velocityBuffer[i3] += noiseX + interactionForceX + jitterX
      this.velocityBuffer[i3 + 1] += noiseY + interactionForceY + jitterY
      this.velocityBuffer[i3 + 2] += noiseZ + interactionForceZ + jitterZ

      // Apply damping (heavier particles maintain momentum better)
      const damping = this.particleDamping + 0.01 * (1 - Math.min(mass, 1.5) / 1.5)
      this.velocityBuffer[i3] *= damping
      this.velocityBuffer[i3 + 1] *= damping
      this.velocityBuffer[i3 + 2] *= damping

      // Apply velocity limits based on mass
      const maxSpeed = this.maxParticleSpeed / Math.sqrt(mass)
      const currentSpeed = Math.sqrt(
        this.velocityBuffer[i3] * this.velocityBuffer[i3] +
          this.velocityBuffer[i3 + 1] * this.velocityBuffer[i3 + 1] +
          this.velocityBuffer[i3 + 2] * this.velocityBuffer[i3 + 2],
      )

      if (currentSpeed > maxSpeed) {
        const speedFactor = maxSpeed / currentSpeed
        this.velocityBuffer[i3] *= speedFactor
        this.velocityBuffer[i3 + 1] *= speedFactor
        this.velocityBuffer[i3 + 2] *= speedFactor
      }

      // Update positions
      this.positionBuffer[i3] += this.velocityBuffer[i3]
      this.positionBuffer[i3 + 1] += this.velocityBuffer[i3 + 1]
      this.positionBuffer[i3 + 2] += this.velocityBuffer[i3 + 2]

      // Keep particles within bounds
      // Y-axis (vertical) bounds
      if (Math.abs(this.positionBuffer[i3 + 1]) > 2) {
        this.positionBuffer[i3 + 1] = Math.sign(this.positionBuffer[i3 + 1]) * 2
        this.velocityBuffer[i3 + 1] *= -0.8 // More elastic bounce
      }

      // Radial bounds (maximum distance from center line)
      const currentDist = Math.sqrt(
        this.positionBuffer[i3] * this.positionBuffer[i3] +
          this.positionBuffer[i3 + 2] * this.positionBuffer[i3 + 2],
      )

      if (currentDist > this.maxRadius) {
        const scale = this.maxRadius / currentDist
        this.positionBuffer[i3] *= scale
        this.positionBuffer[i3 + 2] *= scale

        // Adjust velocity to bounce off the cylindrical boundary
        const vDot =
          (this.velocityBuffer[i3] * this.positionBuffer[i3] +
            this.velocityBuffer[i3 + 2] * this.positionBuffer[i3 + 2]) /
          currentDist

        // Only reflect the component of velocity pointing outward
        if (vDot > 0) {
          const normalX = this.positionBuffer[i3] / currentDist
          const normalZ = this.positionBuffer[i3 + 2] / currentDist

          this.velocityBuffer[i3] -= this.bounceElasticity * vDot * normalX
          this.velocityBuffer[i3 + 2] -= this.bounceElasticity * vDot * normalZ
        }
      }
    }

    // Update geometry
    const positionAttribute = this.particles.geometry.attributes.position as THREE.BufferAttribute
    positionAttribute.array = this.positionBuffer
    positionAttribute.needsUpdate = true

    // Render
    this.renderer.render(this.scene, this.camera)
  }

  private onResize() {
    const canvas = this.renderer.domElement
    const parent = canvas.parentElement

    if (parent) {
      const width = parent.clientWidth
      const height = parent.clientHeight

      this.canvasHeight = height

      // Update camera
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()

      // Update renderer
      this.renderer.setSize(width, height, false)
    }
  }

  public dispose() {
    window.removeEventListener('resize', this.onResize)
    this.particles.geometry.dispose()
    if (this.particles.material instanceof THREE.Material) {
      this.particles.material.dispose()
    } else if (Array.isArray(this.particles.material)) {
      this.particles.material.forEach((material) => material.dispose())
    }

    this.renderer.dispose()
  }

  // Apply the smooth transitions in the animation loop
  private updateTransitions() {
    // Helper function for smooth interpolation
    const lerpValue = (current: number, target: number): number => {
      return current + (target - current) * this.transitionSpeed
    }

    // Smoothly transition all parameters
    this.attractionStrengthBase = lerpValue(
      this.attractionStrengthBase,
      this.targetAttractionStrength,
    )
    this.noiseScale = lerpValue(this.noiseScale, this.targetNoiseScale)
    this.noiseStrength = lerpValue(this.noiseStrength, this.targetNoiseStrength)
    this.particleDamping = lerpValue(this.particleDamping, this.targetDamping)
    this.maxParticleSpeed = lerpValue(this.maxParticleSpeed, this.targetMaxSpeed)
    this.particleRepulsion = lerpValue(this.particleRepulsion, this.targetRepulsion)
    this.particleAlignment = lerpValue(this.particleAlignment, this.targetAlignment)
    this.bounceElasticity = lerpValue(this.bounceElasticity, this.targetBounceElasticity)
    this.maxRadius = lerpValue(this.maxRadius, this.targetMaxRadius)
  }

  // Initialize debug grid visualization
  private initDebugGrid() {
    const gridSize = 1.0 // Spacing of grid points
    const gridRange = 4 // Extent from origin (e.g., -4 to +4)
    const pointSize = 0.05 // Visual size of grid markers
    const gridGeometry = new THREE.BoxGeometry(pointSize, pointSize, pointSize)

    for (let x = -gridRange; x <= gridRange; x += gridSize) {
      for (let y = -gridRange / 2; y <= gridRange / 2; y += gridSize) {
        // Reduced Y range
        for (let z = -gridRange; z <= gridRange; z += gridSize) {
          const pointMesh = new THREE.Mesh(gridGeometry, this.debugGridMaterial)
          pointMesh.position.set(x, y, z)
          pointMesh.visible = this.showDebugGrid // Set initial visibility
          this.scene.add(pointMesh)
          this.debugGridPoints.push(pointMesh)
        }
      }
    }

    // Log scene children to confirm grid points are added
    console.log('Scene children after adding debug grid:', this.scene.children)
  }

  // Method to update the visual size of debug grid points
  public updateDebugGridPointSize(size: number) {
    // Check if size actually changed to avoid unnecessary geometry recreation
    if (this.debugGridPoints.length > 0 && this.debugGridPoints[0].scale.x === size) {
      return // No change needed
    }

    // Update scale of existing meshes instead of recreating geometry (more efficient)
    for (const mesh of this.debugGridPoints) {
      mesh.scale.set(size / 0.05, size / 0.05, size / 0.05) // Scale relative to original BoxGeometry size (0.05)
    }
  }

  // New method to toggle debug grid visibility
  public setDebugGridVisibility(visible: boolean) {
    if (this.showDebugGrid === visible) return // No change needed
    this.showDebugGrid = visible
    for (const mesh of this.debugGridPoints) {
      mesh.visible = visible
    }
  }

  // Method to update camera position
  public updateCameraPosition(x: number, y: number, z: number) {
    this.camera.position.set(x, y, z)
    this.camera.lookAt(0, 0, 0) // Ensure camera always points towards the origin
  }

  // Getter methods to expose private properties for UI synchronization
  public getParameters() {
    return {
      attractionStrength: this.attractionStrengthBase,
      noiseScale: this.noiseScale,
      noiseStrength: this.noiseStrength,
      damping: this.particleDamping,
      maxSpeed: this.maxParticleSpeed,
      repulsion: this.particleRepulsion,
      alignment: this.particleAlignment,
      bounceElasticity: this.bounceElasticity,
      maxRadius: this.maxRadius,
    }
  }
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const systemRef = useRef<ParticleSystem | null>(null)

  // Create Leva controls with proper types
  const params = useControls(
    {
      'Particle Physics': folder({
        attractionStrength: {
          value: 0.02,
          min: 0.01,
          max: 0.5,
          step: 0.01,
          label: 'Attraction Force',
        },
        noiseScale: {
          value: 1.0,
          min: 0.5,
          max: 5.0,
          step: 0.1,
          label: 'Noise Scale',
        },
        noiseStrength: {
          value: 0.015,
          min: 0.001,
          max: 0.1,
          step: 0.001,
          label: 'Noise Strength',
        },
        damping: {
          value: 0.97,
          min: 0.9,
          max: 0.999,
          step: 0.001,
          label: 'Momentum',
        },
        maxSpeed: {
          value: 0.07,
          min: 0.01,
          max: 0.2,
          step: 0.01,
          label: 'Max Speed',
        },
      }),
      'Particle Interactions': folder({
        repulsion: {
          value: 0,
          min: 0.0001,
          max: 0.001,
          step: 0.0001,
          label: 'Repulsion',
        },
        alignment: {
          value: 0,
          min: 0,
          max: 0.001,
          step: 0.0001,
          label: 'Alignment',
        },
        bounceElasticity: {
          value: 1.5,
          min: 0.5,
          max: 2.5,
          step: 0.1,
          label: 'Bounce Elasticity',
        },
        maxRadius: {
          value: 2.0,
          min: 0.5,
          max: 5.0,
          step: 0.1,
          label: 'Boundary Radius',
        },
      }),
      // Add Debug folder for grid visibility
      Debug: folder({
        showDebugGrid: {
          value: false,
          label: 'Show Noise Grid',
        },
        cameraX: { value: 0, min: -10, max: 10, step: 0.1, label: 'Camera X' },
        cameraY: { value: 0, min: -10, max: 10, step: 0.1, label: 'Camera Y' },
        cameraZ: { value: 6, min: 1, max: 20, step: 0.1, label: 'Camera Z' },
        debugGridPointSize: {
          value: 0.5,
          min: 0.01,
          max: 1.0,
          step: 0.01,
          label: 'Grid Point Size',
        },
      }),
    },
    { collapsed: true },
  )

  // Initialize the particle system only once
  useEffect(() => {
    if (!canvasRef.current) return

    // Create particle system
    try {
      const system = new ParticleSystem(canvasRef.current, {
        attractionStrength: params.attractionStrength,
        noiseScale: params.noiseScale,
        noiseStrength: params.noiseStrength,
        damping: params.damping,
        maxSpeed: params.maxSpeed,
        repulsion: params.repulsion,
        alignment: params.alignment,
        bounceElasticity: params.bounceElasticity,
        maxRadius: params.maxRadius,
      })
      systemRef.current = system

      // Animation loop
      let animationFrameId: number
      const animate = () => {
        // Update physics parameters from controls
        if (systemRef.current) {
          systemRef.current.updatePhysicsParams({
            attractionStrength: params.attractionStrength,
            noiseScale: params.noiseScale,
            noiseStrength: params.noiseStrength,
            damping: params.damping,
            maxSpeed: params.maxSpeed,
            repulsion: params.repulsion,
            alignment: params.alignment,
            bounceElasticity: params.bounceElasticity,
            maxRadius: params.maxRadius,
          })

          // Update debug grid visibility from controls
          systemRef.current.setDebugGridVisibility(params.showDebugGrid)

          // Update camera position from controls
          systemRef.current.updateCameraPosition(params.cameraX, params.cameraY, params.cameraZ)

          // Update debug grid point size
          systemRef.current.updateDebugGridPointSize(params.debugGridPointSize)
        }

        system.animate()
        animationFrameId = requestAnimationFrame(animate)
      }
      animate()

      // Cleanup
      return () => {
        cancelAnimationFrame(animationFrameId)
        system.dispose()
      }
    } catch (error) {
      console.error('Failed to initialize particle system:', error)
    }
  }, [
    params.attractionStrength,
    params.noiseScale,
    params.noiseStrength,
    params.damping,
    params.maxSpeed,
    params.repulsion,
    params.alignment,
    params.bounceElasticity,
    params.maxRadius,
    params.showDebugGrid,
    params.cameraX,
    params.cameraY,
    params.cameraZ,
    params.debugGridPointSize,
  ])

  // Use layout effect to ensure canvas size is set before first paint
  useLayoutEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const parent = canvas.parentElement

      if (parent) {
        // Set initial canvas size to match parent dimensions
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
        canvas.style.width = `${parent.clientWidth}px`
        canvas.style.height = `${parent.clientHeight}px`
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={css({
        top: '-50%',
        left: '-50%',
        transformOrigin: 'center',
        transform: 'translate3d(50%, 50%, 0)',
        // w: 'full',
        // h: 'full',
        position: 'absolute',
      })}
    />
  )
}
