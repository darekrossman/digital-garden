'use client'

import { css } from '@/styled-system/css'
import { folder, useControls } from 'leva'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { WebGLRenderer } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

class WireframeModel {
  private renderer: WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private headModel: THREE.Group | null = null
  private wireframeMaterial: THREE.LineBasicMaterial
  private wireframeLines: THREE.LineSegments | null = null
  private maxVertices: number = 800 // Increased number of vertices
  private connectionDistance: number = 0.2 // Maximum distance for connecting vertices
  private clock: THREE.Clock
  private canvasHeight: number = 0
  private cameraPosition: THREE.Vector3
  private cameraRotation: THREE.Euler
  private autoRotate: boolean = true
  private rotationSpeed: number = 0.1
  private modelScale: number
  private lineColor: THREE.Color
  private lineOpacity: number
  private lineWidth: number

  constructor(
    canvas: HTMLCanvasElement,
    initialParams: {
      modelScale: number
      lineColor: THREE.Color
      lineOpacity: number
      lineWidth: number
      maxVertices: number
      connectionDistance: number
      cameraPosition: THREE.Vector3
      cameraRotation: THREE.Euler
      autoRotate: boolean
      rotationSpeed: number
    },
  ) {
    this.modelScale = initialParams.modelScale
    this.lineColor = initialParams.lineColor
    this.lineOpacity = initialParams.lineOpacity
    this.lineWidth = initialParams.lineWidth
    this.maxVertices = initialParams.maxVertices
    this.connectionDistance = initialParams.connectionDistance
    this.cameraPosition = initialParams.cameraPosition.clone()
    this.cameraRotation = initialParams.cameraRotation.clone()
    this.autoRotate = initialParams.autoRotate
    this.rotationSpeed = initialParams.rotationSpeed
    this.canvasHeight = canvas.clientHeight
    this.clock = new THREE.Clock()

    // Scene setup
    this.scene = new THREE.Scene()
    const aspect = canvas.clientWidth / canvas.clientHeight
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 15)
    this.camera.position.copy(this.cameraPosition)
    this.camera.rotation.copy(this.cameraRotation)

    // Set up renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setClearColor(0x000000, 0) // Fully transparent background

    // Create wireframe material
    this.wireframeMaterial = new THREE.LineBasicMaterial({
      color: this.lineColor,
      transparent: true,
      opacity: this.lineOpacity,
      linewidth: this.lineWidth,
    })

    // Load the 3D model
    this.loadHeadModel()

    // Handle resize
    this.onResize = this.onResize.bind(this)
    window.addEventListener('resize', this.onResize)

    // Initial resize
    this.onResize()
  }

  // Convert model to a sparse wireframe connecting key vertices
  private convertToSparseWireframe() {
    if (!this.headModel) return

    // Store current rotation if wireframe already exists
    let currentRotation: THREE.Euler | null = null
    if (this.wireframeLines) {
      currentRotation = this.wireframeLines.rotation.clone()
      this.scene.remove(this.wireframeLines)
      this.wireframeLines.geometry.dispose()
    }

    // Extract vertices from model
    const vertices: THREE.Vector3[] = []
    const worldMatrix = new THREE.Matrix4()

    this.headModel.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const geometry = child.geometry

        // Ensure geometry has vertex normals
        if (!geometry.getAttribute('normal')) {
          geometry.computeVertexNormals()
        }

        // Get position attribute
        const positionAttr = geometry.getAttribute('position')

        // Update world matrix to get correct vertex positions
        child.updateWorldMatrix(true, false)
        worldMatrix.copy(child.matrixWorld)

        // Sample vertices at regular intervals for even coverage
        const totalVertices = positionAttr.count
        const stride = Math.max(1, Math.floor(totalVertices / this.maxVertices))

        for (let i = 0; i < totalVertices; i += stride) {
          if (vertices.length >= this.maxVertices) break

          const idx = i * 3
          const vertex = new THREE.Vector3(
            positionAttr.array[idx],
            positionAttr.array[idx + 1],
            positionAttr.array[idx + 2],
          ).applyMatrix4(worldMatrix)

          vertices.push(vertex)
        }
      }
    })

    // Create lines between nearby vertices
    const points: THREE.Vector3[] = []
    const connectionDistanceSq = this.connectionDistance * this.connectionDistance

    // Create connections between nearby vertices
    for (let i = 0; i < vertices.length; i++) {
      const v1 = vertices[i]

      // Find connections to nearby vertices
      for (let j = i + 1; j < vertices.length; j++) {
        const v2 = vertices[j]
        const distSq = v1.distanceToSquared(v2)

        // Connect if within connection distance
        if (distSq < connectionDistanceSq) {
          points.push(v1.clone(), v2.clone())
        }
      }
    }

    // Create line segments
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    this.wireframeLines = new THREE.LineSegments(geometry, this.wireframeMaterial)

    // Restore rotation if it existed
    if (currentRotation) {
      this.wireframeLines.rotation.copy(currentRotation)
    } else if (this.headModel) {
      // Initialize from model rotation
      this.wireframeLines.rotation.copy(this.headModel.rotation)
    }

    this.scene.add(this.wireframeLines)

    console.log(
      `Created sparse wireframe with ${vertices.length} vertices and ${points.length / 2} connections`,
    )

    // Hide original model
    this.headModel.visible = false
  }

  // Load the head model
  private loadHeadModel() {
    const loader = new GLTFLoader()

    loader.load(
      '/head.glb',
      (gltf) => {
        this.headModel = gltf.scene
        this.headModel.scale.set(this.modelScale, this.modelScale, this.modelScale)

        // Center the model in the scene
        const box = new THREE.Box3().setFromObject(this.headModel)
        const center = box.getCenter(new THREE.Vector3())
        this.headModel.position.sub(center)

        // Add model to scene but don't render the original meshes
        this.scene.add(this.headModel)

        // Create sparse wireframe
        this.convertToSparseWireframe()
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error)
      },
    )
  }

  // Update wireframe parameters
  public updateParameters(params: {
    modelScale: number
    lineColor: THREE.Color
    lineOpacity: number
    lineWidth: number
    maxVertices: number
    connectionDistance: number
    cameraPosition: THREE.Vector3
    cameraRotation: THREE.Euler
    autoRotate: boolean
    rotationSpeed: number
  }) {
    // Store current wireframe rotation to preserve it
    let currentRotation: THREE.Euler | null = null
    if (this.wireframeLines) {
      currentRotation = this.wireframeLines.rotation.clone()
    }

    // Update local parameters
    this.modelScale = params.modelScale
    this.lineColor = params.lineColor
    this.lineOpacity = params.lineOpacity
    this.lineWidth = params.lineWidth

    // Check if we need to rebuild the wireframe due to vertex parameter changes
    const rebuildWireframe =
      this.maxVertices !== params.maxVertices ||
      this.connectionDistance !== params.connectionDistance

    this.maxVertices = params.maxVertices
    this.connectionDistance = params.connectionDistance
    this.cameraPosition = params.cameraPosition.clone()
    this.cameraRotation = params.cameraRotation.clone()
    this.autoRotate = params.autoRotate
    this.rotationSpeed = params.rotationSpeed

    // Update wireframe material
    this.wireframeMaterial.color = this.lineColor
    this.wireframeMaterial.opacity = this.lineOpacity
    this.wireframeMaterial.linewidth = this.lineWidth

    // Update model scale if it changed significantly
    if (this.headModel) {
      this.headModel.scale.set(this.modelScale, this.modelScale, this.modelScale)

      // Rebuild wireframe if necessary
      if (rebuildWireframe) {
        this.convertToSparseWireframe()

        // Restore rotation if preserved
        if (currentRotation && this.wireframeLines) {
          this.wireframeLines.rotation.copy(currentRotation)
        }
      }
    }

    // Update camera
    this.camera.position.copy(this.cameraPosition)
    this.camera.rotation.copy(this.cameraRotation)
  }

  public animate() {
    // Auto-rotate model if enabled
    if (this.autoRotate && this.wireframeLines) {
      const deltaTime = this.clock.getDelta()
      this.wireframeLines.rotation.y += deltaTime * this.rotationSpeed
    }

    // Render scene
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

    // Clean up materials and geometries
    this.wireframeMaterial.dispose()

    // Clean up wireframe
    if (this.wireframeLines) {
      if (this.wireframeLines.geometry) this.wireframeLines.geometry.dispose()
      this.scene.remove(this.wireframeLines)
    }

    // Clean up model
    if (this.headModel) {
      this.headModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose()
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((material) => material.dispose())
            } else {
              child.material.dispose()
            }
          }
        }
      })
      this.scene.remove(this.headModel)
    }

    this.renderer.dispose()
  }
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wireframeRef = useRef<WireframeModel | null>(null)

  // Create Leva controls with proper types
  const params = useControls(
    {
      Model: folder({
        modelScale: {
          value: 1.0,
          min: 0.5,
          max: 2.0,
          step: 0.1,
          label: 'Scale',
        },
        autoRotate: {
          value: true,
          label: 'Auto Rotate',
        },
        rotationSpeed: {
          value: 0.5,
          min: 0.1,
          max: 2.0,
          step: 0.1,
          label: 'Rotation Speed',
        },
      }),
      Wireframe: folder({
        maxVertices: {
          value: 800,
          min: 100,
          max: 2000,
          step: 10,
          label: 'Vertex Count',
        },
        connectionDistance: {
          value: 0.2,
          min: 0.1,
          max: 0.5,
          step: 0.01,
          label: 'Connection Radius',
        },
        lineColor: {
          value: '#000000',
          label: 'Line Color',
        },
        lineOpacity: {
          value: 1.0,
          min: 0.1,
          max: 1.0,
          step: 0.05,
          label: 'Line Opacity',
        },
        lineWidth: {
          value: 1,
          min: 1,
          max: 3,
          step: 1,
          label: 'Line Width',
        },
      }),
      Camera: folder({
        cameraPositionX: {
          value: 0,
          min: -10,
          max: 10,
          step: 0.1,
          label: 'Position X',
        },
        cameraPositionY: {
          value: 0,
          min: -10,
          max: 10,
          step: 0.1,
          label: 'Position Y',
        },
        cameraPositionZ: {
          value: 6,
          min: 1,
          max: 15,
          step: 0.1,
          label: 'Position Z',
        },
        cameraRotationX: {
          value: 0,
          min: -Math.PI,
          max: Math.PI,
          step: 0.01,
          label: 'Rotation X',
        },
        cameraRotationY: {
          value: 0,
          min: -Math.PI,
          max: Math.PI,
          step: 0.01,
          label: 'Rotation Y',
        },
        cameraRotationZ: {
          value: 0,
          min: -Math.PI,
          max: Math.PI,
          step: 0.01,
          label: 'Rotation Z',
        },
      }),
    },
    { collapsed: true },
  )

  // Create derived camera position and rotation from control values
  const cameraPosition = new THREE.Vector3(
    params.cameraPositionX,
    params.cameraPositionY,
    params.cameraPositionZ,
  )

  const cameraRotation = new THREE.Euler(
    params.cameraRotationX,
    params.cameraRotationY,
    params.cameraRotationZ,
  )

  // Convert color string to THREE.Color
  const lineColor = new THREE.Color(params.lineColor)

  // Initialize the wireframe model
  useEffect(() => {
    if (!canvasRef.current) return

    try {
      const wireframeModel = new WireframeModel(canvasRef.current, {
        modelScale: params.modelScale,
        lineColor: lineColor,
        lineOpacity: params.lineOpacity,
        lineWidth: params.lineWidth,
        maxVertices: params.maxVertices,
        connectionDistance: params.connectionDistance,
        cameraPosition: cameraPosition,
        cameraRotation: cameraRotation,
        autoRotate: params.autoRotate,
        rotationSpeed: params.rotationSpeed,
      })
      wireframeRef.current = wireframeModel

      // Animation loop
      let animationFrameId: number
      const animate = () => {
        if (wireframeRef.current) {
          wireframeRef.current.updateParameters({
            modelScale: params.modelScale,
            lineColor: lineColor,
            lineOpacity: params.lineOpacity,
            lineWidth: params.lineWidth,
            maxVertices: params.maxVertices,
            connectionDistance: params.connectionDistance,
            cameraPosition: cameraPosition,
            cameraRotation: cameraRotation,
            autoRotate: params.autoRotate,
            rotationSpeed: params.rotationSpeed,
          })
        }

        wireframeModel.animate()
        animationFrameId = requestAnimationFrame(animate)
      }
      animate()

      // Cleanup
      return () => {
        cancelAnimationFrame(animationFrameId)
        wireframeModel.dispose()
      }
    } catch (error) {
      console.error('Failed to initialize wireframe model:', error)
    }
  }, [
    params.modelScale,
    params.lineColor,
    params.lineOpacity,
    params.lineWidth,
    params.maxVertices,
    params.connectionDistance,
    params.cameraPositionX,
    params.cameraPositionY,
    params.cameraPositionZ,
    params.cameraRotationX,
    params.cameraRotationY,
    params.cameraRotationZ,
    params.autoRotate,
    params.rotationSpeed,
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
        position: 'absolute',
      })}
    />
  )
}
