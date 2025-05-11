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
  private attractors: THREE.Vector3[] = []
  private attractorVelocities: THREE.Vector3[] = []
  private attractorMeshes: THREE.Mesh[] = []
  private clock: THREE.Clock
  private canvasHeight: number = 0
  private noise: (x: number, y: number, z: number) => number
  private time: number = 0
  private showAttractors: boolean = true
  private attractorSize: number = 0.05
  private attractorColor: number = 0x000000
  private attractorOpacity: number = 0.6

  // Physics parameters that can be controlled
  private attractionStrengthBase: number = 0.15
  private noiseScale: number = 2.0
  private noiseStrength: number = 0.025
  private particleDamping: number = 0.98
  private maxParticleSpeed: number = 0.05
  private particleRepulsion: number = 0.0005
  private particleAlignment: number = 0.0003
  private bounceElasticity: number = 1.8
  private maxRadius: number = 1.2
  // Attractor parameters
  private numAttractors: number = 3
  private attractorSpeed: number = 0.01
  private attractorMaxDistance: number = 1.0
  private attractorNoiseScale: number = 0.5

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
  private targetAttractorSpeed: number
  private targetAttractorSize: number
  private targetAttractorOpacity: number

  // Transition speed (0-1, where 1 is immediate)
  private transitionSpeed: number = 0.05

  // Initialize with random parameters
  public initRandomParameters() {
    // Helper function to get a random value within a range
    const randomInRange = (min: number, max: number): number => {
      return min + Math.random() * (max - min)
    }

    // Randomize core parameters with sensible ranges
    this.attractionStrengthBase = randomInRange(0.05, 0.15)
    this.noiseScale = randomInRange(1.0, 2.5)
    this.noiseStrength = randomInRange(0.01, 0.04)
    this.particleDamping = randomInRange(0.97, 0.995)
    this.maxParticleSpeed = randomInRange(0.05, 0.12)
    this.particleRepulsion = randomInRange(0.0002, 0.0006)
    this.particleAlignment = randomInRange(0.0001, 0.0003)
    this.bounceElasticity = randomInRange(1.2, 1.8)
    this.maxRadius = randomInRange(2.0, 3.0)
    this.attractorSpeed = randomInRange(0.005, 0.015)

    // Also set target values to match
    this.targetAttractionStrength = this.attractionStrengthBase
    this.targetNoiseScale = this.noiseScale
    this.targetNoiseStrength = this.noiseStrength
    this.targetDamping = this.particleDamping
    this.targetMaxSpeed = this.maxParticleSpeed
    this.targetRepulsion = this.particleRepulsion
    this.targetAlignment = this.particleAlignment
    this.targetBounceElasticity = this.bounceElasticity
    this.targetMaxRadius = this.maxRadius
    this.targetAttractorSpeed = this.attractorSpeed
    this.targetAttractorSize = this.attractorSize
    this.targetAttractorOpacity = this.attractorOpacity

    // Randomize number of attractors (2-4)
    const numAttr = Math.floor(randomInRange(2, 5))
    if (numAttr !== this.numAttractors) {
      this.numAttractors = numAttr
      // We'll update the actual attractors after initializing the system
    }

    // Randomize attractor distances
    this.attractorMaxDistance = randomInRange(0.7, 1.5)
    this.attractorNoiseScale = randomInRange(0.3, 0.8)
  }

  constructor(canvas: HTMLCanvasElement) {
    this.numParticles = 8000
    this.positionBuffer = new Float32Array(this.numParticles * 3)
    this.velocityBuffer = new Float32Array(this.numParticles * 3)
    this.particleMass = new Float32Array(this.numParticles)
    this.canvasHeight = canvas.clientHeight
    this.clock = new THREE.Clock()

    // Generate random parameters before scene setup
    this.initRandomParameters()

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

    // Initialize attractors
    this.initAttractors()

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
    this.targetAttractorSpeed = this.attractorSpeed
    this.targetAttractorSize = this.attractorSize
    this.targetAttractorOpacity = this.attractorOpacity
  }

  // Method to update physics parameters from controls - now just sets targets
  updatePhysicsParams(params: {
    attractorStrength: number
    noiseScale: number
    noiseStrength: number
    damping: number
    maxSpeed: number
    repulsion: number
    alignment: number
    bounceElasticity: number
    maxRadius: number
    attractorSpeed: number
    attractorMaxDistance?: number
    attractorNoiseScale?: number
    numAttractors?: number
    showAttractors?: boolean
    attractorSize?: number
    attractorOpacity?: number
  }) {
    // Update target values for smooth transitions
    this.targetAttractionStrength = params.attractorStrength
    this.targetNoiseScale = params.noiseScale
    this.targetNoiseStrength = params.noiseStrength
    this.targetDamping = params.damping
    this.targetMaxSpeed = params.maxSpeed
    this.targetRepulsion = params.repulsion
    this.targetAlignment = params.alignment
    this.targetBounceElasticity = params.bounceElasticity
    this.targetMaxRadius = params.maxRadius
    this.targetAttractorSpeed = params.attractorSpeed

    // Handle direct changes for properties that need immediate updates
    if (params.attractorMaxDistance !== undefined) {
      this.attractorMaxDistance = params.attractorMaxDistance
    }

    if (params.attractorNoiseScale !== undefined) {
      this.attractorNoiseScale = params.attractorNoiseScale
    }

    // Handle visibility toggle (needs immediate update)
    if (params.showAttractors !== undefined && params.showAttractors !== this.showAttractors) {
      this.showAttractors = params.showAttractors
      this.updateAttractorVisibility()
    }

    // Set target values for appearance properties
    if (params.attractorSize !== undefined) {
      this.targetAttractorSize = params.attractorSize
    }

    if (params.attractorOpacity !== undefined) {
      this.targetAttractorOpacity = params.attractorOpacity
    }

    // Handle dynamic number of attractors (only if changed)
    if (params.numAttractors !== undefined && params.numAttractors !== this.numAttractors) {
      this.updateAttractorCount(params.numAttractors)
    }
  }

  // Method to update the number of attractors
  private updateAttractorCount(newCount: number) {
    // Skip if no change or invalid count
    if (newCount === this.numAttractors || newCount < 1) return

    // Remove excess attractors if reducing count
    while (this.attractors.length > newCount) {
      const mesh = this.attractorMeshes.pop()
      if (mesh) {
        this.scene.remove(mesh)
        mesh.geometry.dispose()
        if (mesh.material instanceof THREE.Material) {
          mesh.material.dispose()
        }
      }
      this.attractors.pop()
      this.attractorVelocities.pop()
    }

    // Add new attractors if increasing count
    if (this.attractors.length < newCount) {
      const attractorGeometry = new THREE.SphereGeometry(this.attractorSize, 8, 8)

      while (this.attractors.length < newCount) {
        const i = this.attractors.length
        // Create attractors at different distances from center
        const distance = 0.2 + (i / newCount) * this.attractorMaxDistance
        const angle = Math.random() * Math.PI * 2
        const y = (Math.random() * 2 - 1) * 1.5

        // Position
        const attractor = new THREE.Vector3(
          Math.cos(angle) * distance,
          y,
          Math.sin(angle) * distance,
        )

        // Random initial velocity direction
        const velAngle = Math.random() * Math.PI * 2
        const velocity = new THREE.Vector3(
          Math.cos(velAngle) * this.attractorSpeed,
          (Math.random() * 2 - 1) * this.attractorSpeed,
          Math.sin(velAngle) * this.attractorSpeed,
        )

        // Create visual mesh for the attractor
        const attractorMaterial = new THREE.MeshBasicMaterial({
          color: this.attractorColor,
          transparent: true,
          opacity: this.attractorOpacity,
        })
        const attractorMesh = new THREE.Mesh(attractorGeometry, attractorMaterial)
        attractorMesh.position.copy(attractor)
        this.scene.add(attractorMesh)

        this.attractors.push(attractor)
        this.attractorVelocities.push(velocity)
        this.attractorMeshes.push(attractorMesh)
      }
    }

    // Update the count
    this.numAttractors = newCount
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
    this.attractorSpeed = lerpValue(this.attractorSpeed, this.targetAttractorSpeed)

    // Handle appearance changes that need special treatment when they change enough
    const newAttractorSize = lerpValue(this.attractorSize, this.targetAttractorSize)
    if (Math.abs(newAttractorSize - this.attractorSize) > 0.001) {
      this.attractorSize = newAttractorSize
      this.updateAttractorSize()
    }

    const newAttractorOpacity = lerpValue(this.attractorOpacity, this.targetAttractorOpacity)
    if (Math.abs(newAttractorOpacity - this.attractorOpacity) > 0.01) {
      this.attractorOpacity = newAttractorOpacity
      this.updateAttractorOpacity()
    }
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

  // Initialize attractors at random positions
  private initAttractors() {
    // Create a small sphere geometry for the attractors
    const attractorGeometry = new THREE.SphereGeometry(this.attractorSize, 8, 8)
    const attractorMaterials = [
      new THREE.MeshBasicMaterial({
        color: this.attractorColor,
        transparent: true,
        opacity: this.attractorOpacity,
      }),
      new THREE.MeshBasicMaterial({
        color: this.attractorColor,
        transparent: true,
        opacity: this.attractorOpacity,
      }),
      new THREE.MeshBasicMaterial({
        color: this.attractorColor,
        transparent: true,
        opacity: this.attractorOpacity,
      }),
    ]

    for (let i = 0; i < this.numAttractors; i++) {
      // Create attractors at different distances from center
      const distance = 0.2 + (i / this.numAttractors) * this.attractorMaxDistance
      const angle = Math.random() * Math.PI * 2
      const y = (Math.random() * 2 - 1) * 1.5

      // Position
      const attractor = new THREE.Vector3(Math.cos(angle) * distance, y, Math.sin(angle) * distance)

      // Random initial velocity direction
      const velAngle = Math.random() * Math.PI * 2
      const velocity = new THREE.Vector3(
        Math.cos(velAngle) * this.attractorSpeed,
        (Math.random() * 2 - 1) * this.attractorSpeed,
        Math.sin(velAngle) * this.attractorSpeed,
      )

      // Create visual mesh for the attractor
      const attractorMesh = new THREE.Mesh(attractorGeometry, attractorMaterials[i])
      attractorMesh.position.copy(attractor)
      this.scene.add(attractorMesh)

      this.attractors.push(attractor)
      this.attractorVelocities.push(velocity)
      this.attractorMeshes.push(attractorMesh)
    }
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
      this.particleMass[i] = 0.5 + Math.random() * 1.5
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
  }

  public animate() {
    const deltaTime = Math.min(this.clock.getDelta(), 0.1)
    this.time += deltaTime

    // Apply smooth transitions for parameters
    this.updateTransitions()

    // Update attractor positions
    this.updateAttractors(deltaTime)

    // Determine the canvas aspect ratio for proper particle distribution
    const aspectRatio = this.renderer.domElement.width / this.renderer.domElement.height

    // Update particle positions with individual momentum and interactions
    for (let i = 0; i < this.numParticles; i++) {
      const i3 = i * 3
      const mass = this.particleMass[i]

      // Current position
      const x = this.positionBuffer[i3]
      const y = this.positionBuffer[i3 + 1]
      const z = this.positionBuffer[i3 + 2]

      // Initialize attractor forces
      let attractorForceX = 0
      let attractorForceY = 0
      let attractorForceZ = 0

      // Calculate forces from all attractors
      for (const attractor of this.attractors) {
        // Vector from particle to attractor
        const dx = attractor.x - x
        const dy = attractor.y - y
        const dz = attractor.z - z

        // Distance (squared) to attractor
        const distSq = dx * dx + dy * dy + dz * dz
        const dist = Math.sqrt(distSq)

        // Attraction force (stronger when closer)
        const forceMagnitude = this.attractionStrengthBase / (mass * Math.max(0.1, dist))

        // Add normalized direction vector multiplied by force
        attractorForceX += (dx / dist) * forceMagnitude * deltaTime
        attractorForceY += (dy / dist) * forceMagnitude * deltaTime
        attractorForceZ += (dz / dist) * forceMagnitude * deltaTime
      }

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
      const interactionSamples = 12 // Check only a few other particles for interactions
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
      this.velocityBuffer[i3] += attractorForceX + noiseX + interactionForceX + jitterX
      this.velocityBuffer[i3 + 1] += attractorForceY + noiseY + interactionForceY + jitterY
      this.velocityBuffer[i3 + 2] += attractorForceZ + noiseZ + interactionForceZ + jitterZ

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

  // Update attractor positions
  private updateAttractors(deltaTime: number) {
    for (let i = 0; i < this.attractors.length; i++) {
      const attractor = this.attractors[i]
      const velocity = this.attractorVelocities[i]

      // Apply noise to velocity for organic movement
      velocity.x +=
        (this.noise(
          attractor.x * this.attractorNoiseScale,
          attractor.y * this.attractorNoiseScale,
          this.time * 0.1 + i * 100,
        ) -
          0.5) *
        0.002
      velocity.y +=
        (this.noise(
          attractor.x * this.attractorNoiseScale + 200,
          attractor.y * this.attractorNoiseScale,
          this.time * 0.1 + i * 100,
        ) -
          0.5) *
        0.002
      velocity.z +=
        (this.noise(
          attractor.x * this.attractorNoiseScale,
          attractor.y * this.attractorNoiseScale + 400,
          this.time * 0.1 + i * 100,
        ) -
          0.5) *
        0.002

      // Limit velocity
      const speed = velocity.length()
      if (speed > this.attractorSpeed * 2) {
        velocity.multiplyScalar((this.attractorSpeed * 2) / speed)
      }

      // Update position
      attractor.add(velocity.clone().multiplyScalar(deltaTime * 30))

      // Keep attractors within bounds
      const distance = Math.sqrt(attractor.x * attractor.x + attractor.z * attractor.z)
      if (distance > this.maxRadius * 0.8) {
        // Apply inward force to keep attractors inside the visible area
        const angle = Math.atan2(attractor.z, attractor.x)
        const inwardForce = (distance - this.maxRadius * 0.8) * 0.1
        velocity.x -= Math.cos(angle) * inwardForce
        velocity.z -= Math.sin(angle) * inwardForce
      }

      // Bounce off vertical boundaries
      if (Math.abs(attractor.y) > 1.8) {
        attractor.y = Math.sign(attractor.y) * 1.8
        velocity.y *= -0.8
      }

      // Update mesh position to match attractor
      if (this.attractorMeshes[i]) {
        this.attractorMeshes[i].position.copy(attractor)
      }
    }
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

    // Clean up attractor meshes
    for (const mesh of this.attractorMeshes) {
      mesh.geometry.dispose()
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose()
      }
      this.scene.remove(mesh)
    }

    this.renderer.dispose()
  }

  // Update visibility of attractor meshes
  private updateAttractorVisibility() {
    for (const mesh of this.attractorMeshes) {
      mesh.visible = this.showAttractors
    }
  }

  // Update size of attractor meshes
  private updateAttractorSize() {
    // Create new geometry with updated size
    const newGeometry = new THREE.SphereGeometry(this.attractorSize, 8, 8)

    // Update each mesh
    for (const mesh of this.attractorMeshes) {
      // Store material before disposing geometry
      const material = mesh.material

      // Dispose old geometry and update with new one
      mesh.geometry.dispose()
      mesh.geometry = newGeometry
    }
  }

  // Update opacity of attractor meshes
  private updateAttractorOpacity() {
    for (const mesh of this.attractorMeshes) {
      if (mesh.material instanceof THREE.Material) {
        mesh.material.opacity = this.attractorOpacity
        mesh.material.needsUpdate = true
      }
    }
  }

  // Getter methods to expose private properties for UI synchronization
  public getParameters() {
    return {
      attractorStrength: this.attractionStrengthBase,
      noiseScale: this.noiseScale,
      noiseStrength: this.noiseStrength,
      damping: this.particleDamping,
      maxSpeed: this.maxParticleSpeed,
      repulsion: this.particleRepulsion,
      alignment: this.particleAlignment,
      bounceElasticity: this.bounceElasticity,
      maxRadius: this.maxRadius,
      attractorSpeed: this.attractorSpeed,
      attractorMaxDistance: this.attractorMaxDistance,
      attractorNoiseScale: this.attractorNoiseScale,
      numAttractors: this.numAttractors,
    }
  }
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const systemRef = useRef<ParticleSystem | null>(null)
  const [randomSeed, setRandomSeed] = useState(Math.random())
  const [randomizeOnStart] = useState(true) // Set to true to randomize on initial load

  // Create Leva controls with proper types
  const params = useControls(
    {
      'Randomize All Parameters': button(() => {
        if (systemRef.current) {
          // Randomize parameters in the system
          systemRef.current.initRandomParameters()

          // Force a re-render to use the new parameters
          setRandomSeed(Math.random())
        }
      }),
      Attractors: folder({
        attractorStrength: {
          value: 0.08,
          min: 0.01,
          max: 0.5,
          step: 0.01,
          label: 'Attraction Force',
        },
        attractorSpeed: {
          value: 0.01,
          min: 0.001,
          max: 0.05,
          step: 0.001,
          label: 'Movement Speed',
        },
        attractorMaxDistance: {
          value: 1.0,
          min: 0.2,
          max: 2.0,
          step: 0.1,
          label: 'Max Distance',
        },
        attractorNoiseScale: {
          value: 0.5,
          min: 0.1,
          max: 2.0,
          step: 0.1,
          label: 'Movement Chaos',
        },
        numAttractors: {
          value: 3,
          min: 1,
          max: 5,
          step: 1,
          label: 'Number of Attractors',
        },
        showAttractors: {
          value: true,
          label: 'Show Attractors',
        },
        attractorSize: {
          value: 0.05,
          min: 0.01,
          max: 0.2,
          step: 0.01,
          label: 'Attractor Size',
        },
        attractorOpacity: {
          value: 0.6,
          min: 0.1,
          max: 1.0,
          step: 0.1,
          label: 'Attractor Opacity',
        },
      }),
      'Particle Physics': folder({
        noiseScale: {
          value: 1.5,
          min: 0.5,
          max: 5.0,
          step: 0.1,
          label: 'Noise Scale',
        },
        noiseStrength: {
          value: 0.02,
          min: 0.001,
          max: 0.1,
          step: 0.001,
          label: 'Noise Strength',
        },
        damping: {
          value: 0.985,
          min: 0.9,
          max: 0.999,
          step: 0.001,
          label: 'Momentum',
        },
        maxSpeed: {
          value: 0.08,
          min: 0.01,
          max: 0.2,
          step: 0.01,
          label: 'Max Speed',
        },
      }),
      'Particle Interactions': folder({
        repulsion: {
          value: 0.0004,
          min: 0.0001,
          max: 0.001,
          step: 0.0001,
          label: 'Repulsion',
        },
        alignment: {
          value: 0.0002,
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
          value: 2.5,
          min: 0.5,
          max: 5.0,
          step: 0.1,
          label: 'Boundary Radius',
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
      const system = new ParticleSystem(canvasRef.current)
      systemRef.current = system

      // Randomize on start if enabled
      if (randomizeOnStart) {
        system.initRandomParameters()
        // Force a re-render to use the new parameters
        setRandomSeed(Math.random())
      }

      // Animation loop
      let animationFrameId: number
      const animate = () => {
        // Update physics parameters from controls
        if (systemRef.current) {
          systemRef.current.updatePhysicsParams(params)
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
    // Remove params from the dependency array so the system doesn't reinitialize when params change
  }, [randomizeOnStart]) // Remove syncSystemToUI dependency

  // Update physics parameters when controls change
  useEffect(() => {
    if (systemRef.current) {
      systemRef.current.updatePhysicsParams(params)
    }
  }, [params]) // Separate effect to handle parameter changes

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
