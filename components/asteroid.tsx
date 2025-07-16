'use client'

import { MotionValue } from 'motion'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { ShaderMaterial } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export interface AsteroidProps {
  rotationX?: number | MotionValue<number>
  rotationY?: number | MotionValue<number>
  rotationZ?: number | MotionValue<number>
  autoRotate?: boolean
  autoRotateSpeed?: number
  // New: control which axes auto-rotate and their speeds
  autoRotateAxes?: ('x' | 'y' | 'z')[]
  autoRotateSpeedX?: number
  autoRotateSpeedY?: number
  autoRotateSpeedZ?: number
  width?: number
  aspectRatio?: number
  height?: number
  className?: string
  // New props for external control
  ambientLight?: {
    color?: string
    intensity?: number
    x?: number
    y?: number
    z?: number
  }
  directionalLight?: {
    color?: string
    intensity?: number
    x?: number | MotionValue<number>
    y?: number | MotionValue<number>
    z?: number | MotionValue<number>
  }
  material?: {
    roughness?: number
    metalness?: number
  }
  // New: tilt props (in degrees)
  tiltX?: number | MotionValue<number>
  tiltZ?: number | MotionValue<number>
}

export default function Asteroid({
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0,
  autoRotate = true,
  autoRotateSpeed = 0.01,
  autoRotateAxes = ['y'],
  autoRotateSpeedX = 0.01,
  autoRotateSpeedY = 0.01,
  autoRotateSpeedZ = 0.01,
  width = 300,
  aspectRatio = 1,
  height = 300,
  className = '',
  ambientLight,
  directionalLight,
  material,
  tiltX = 0,
  tiltZ = 0,
}: AsteroidProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const modelRef = useRef<THREE.Object3D | null>(null)
  const frameIdRef = useRef<number>(0)
  const isDraggingRef = useRef(false)
  const lastMouseRef = useRef<{ x: number; y: number } | null>(null)
  const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null)
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null)

  // Use props if provided, otherwise fallback to defaults
  const [ambientParams, setAmbientParams] = useState({
    color: ambientLight?.color ?? '#ff0000',
    intensity: ambientLight?.intensity ?? 0.2,
    x: ambientLight?.x ?? 0,
    y: ambientLight?.y ?? 0,
    z: ambientLight?.z ?? 0,
  })
  const [directionalParams, setDirectionalParams] = useState({
    color: directionalLight?.color ?? '#f23232',
    intensity: directionalLight?.intensity ?? 11.2,
    x: directionalLight?.x ?? 0.02,
    y: directionalLight?.y ?? 1.4,
    z: directionalLight?.z ?? -0.3,
  })
  const [materialParams, setMaterialParams] = useState({
    roughness: material?.roughness ?? 0.91,
    metalness: material?.metalness ?? 0.53,
  })
  const ambientParamsRef = useRef(ambientParams)
  const directionalParamsRef = useRef(directionalParams)
  const materialParamsRef = useRef(materialParams)

  // Refs for auto-rotation parameters
  const autoRotateRef = useRef(autoRotate)
  const autoRotateAxesRef = useRef(autoRotateAxes)
  const autoRotateSpeedXRef = useRef(autoRotateSpeedX)
  const autoRotateSpeedYRef = useRef(autoRotateSpeedY)
  const autoRotateSpeedZRef = useRef(autoRotateSpeedZ)

  // Make props fully reactive
  useEffect(() => {
    setAmbientParams({
      color: ambientLight?.color ?? '#ff0000',
      intensity: ambientLight?.intensity ?? 0.2,
      x: ambientLight?.x ?? 0,
      y: ambientLight?.y ?? 0,
      z: ambientLight?.z ?? 0,
    })
  }, [ambientLight])

  useEffect(() => {
    setDirectionalParams({
      color: directionalLight?.color ?? '#f23232',
      intensity: directionalLight?.intensity ?? 11.2,
      x: directionalLight?.x ?? -6.1,
      y: directionalLight?.y ?? 2.0,
      z: directionalLight?.z ?? -4.5,
    })
  }, [directionalLight])

  useEffect(() => {
    setMaterialParams({
      roughness: material?.roughness ?? 0.91,
      metalness: material?.metalness ?? 0.53,
    })
  }, [material])

  // Helper to resolve MotionValue or number
  function resolveValue(val: number | MotionValue<number>): number {
    if (typeof val === 'object' && val !== null && 'get' in val) {
      return val.get()
    }
    return val as number
  }

  // Make rotation props fully reactive
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.rotation.x = THREE.MathUtils.degToRad(resolveValue(rotationX))
      modelRef.current.rotation.y = THREE.MathUtils.degToRad(resolveValue(rotationY))
      modelRef.current.rotation.z = THREE.MathUtils.degToRad(resolveValue(rotationZ))
    }
  }, [rotationX, rotationY, rotationZ])

  // Track spin angles for autorotation on each axis
  const spinXRef = useRef(0)
  const spinYRef = useRef(0)
  const spinZRef = useRef(0)

  // Make tilt props fully reactive
  const tiltXRadRef = useRef(THREE.MathUtils.degToRad(resolveValue(tiltX)))
  const tiltZRadRef = useRef(THREE.MathUtils.degToRad(resolveValue(tiltZ)))
  useEffect(() => {
    tiltXRadRef.current = THREE.MathUtils.degToRad(resolveValue(tiltX))
  }, [tiltX])
  useEffect(() => {
    tiltZRadRef.current = THREE.MathUtils.degToRad(resolveValue(tiltZ))
  }, [tiltZ])

  // Make ambientLight and directionalLight props fully reactive
  useEffect(() => {
    if (ambientLight) {
      ambientParamsRef.current = {
        color: ambientLight.color ?? ambientParamsRef.current.color,
        intensity: ambientLight.intensity ?? ambientParamsRef.current.intensity,
        x: ambientLight.x ?? ambientParamsRef.current.x,
        y: ambientLight.y ?? ambientParamsRef.current.y,
        z: ambientLight.z ?? ambientParamsRef.current.z,
      }
    }
  }, [ambientLight])

  useEffect(() => {
    if (directionalLight) {
      directionalParamsRef.current = {
        color: directionalLight.color ?? directionalParamsRef.current.color,
        intensity: directionalLight.intensity ?? directionalParamsRef.current.intensity,
        x: directionalLight.x ?? directionalParamsRef.current.x,
        y: directionalLight.y ?? directionalParamsRef.current.y,
        z: directionalLight.z ?? directionalParamsRef.current.z,
      }
    }
  }, [directionalLight])

  // Update auto-rotation refs when props change
  useEffect(() => {
    autoRotateRef.current = autoRotate
  }, [autoRotate])

  useEffect(() => {
    autoRotateAxesRef.current = autoRotateAxes
  }, [autoRotateAxes])

  useEffect(() => {
    autoRotateSpeedXRef.current = autoRotateSpeedX
    autoRotateSpeedYRef.current = autoRotateSpeedY
    autoRotateSpeedZRef.current = autoRotateSpeedZ
  }, [autoRotateSpeedX, autoRotateSpeedY, autoRotateSpeedZ])

  // Initialize the scene
  useEffect(() => {
    if (!containerRef.current) return

    // Setup scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Setup camera
    const getAspect = () => aspectRatio
    const camera = new THREE.PerspectiveCamera(75, getAspect(), 0.1, 1000)
    camera.position.z = 2
    cameraRef.current = camera

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, width / aspectRatio)
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Setup lighting (create once, update via refs)
    const ambientLight = new THREE.AmbientLight(ambientParams.color, ambientParams.intensity)
    ambientLight.position.set(ambientParams.x, ambientParams.y, ambientParams.z)
    scene.add(ambientLight)
    ambientLightRef.current = ambientLight

    const directionalLight = new THREE.DirectionalLight(
      directionalParams.color,
      directionalParams.intensity,
    )
    directionalLight.position.set(
      resolveValue(directionalParams.x),
      resolveValue(directionalParams.y),
      resolveValue(directionalParams.z),
    )
    scene.add(directionalLight)
    directionalLightRef.current = directionalLight

    // ------------------------------
    // Load textures for the rock material
    const textureLoader = new THREE.TextureLoader()

    // Base color
    const originalDiffuseMap = textureLoader.load('/textures/stone-diffuse.jpg', (texture) => {
      // Convert to grayscale after loading
      const grayscale = toGrayscaleTexture(texture)
      diffuseMap.image = grayscale.image
      diffuseMap.needsUpdate = true
    })
    originalDiffuseMap.colorSpace = THREE.SRGBColorSpace
    // Create a placeholder texture to use immediately
    const diffuseMap = originalDiffuseMap.clone()
    diffuseMap.colorSpace = THREE.SRGBColorSpace

    // Combined Ambient-Occlusion / Roughness / Metalness map (R = AO, G = Roughness, B = Metalness)
    const ormMap = textureLoader.load('/textures/stone-AORoughMetal.jpg')
    ormMap.colorSpace = THREE.LinearSRGBColorSpace

    // Normal map
    const normalMap = textureLoader.load('/textures/stone-normal.jpg')

    // Displacement map (optional – provides real geometric relief)
    const displacementMap = textureLoader.load('/textures/stone-displacement.jpg')
    // Grayscale conversion helper
    function toGrayscaleTexture(texture: THREE.Texture): THREE.Texture {
      const image = texture.image
      if (!image) return texture
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(image, 0, 0)
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i]
        const g = imgData.data[i + 1]
        const b = imgData.data[i + 2]
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
        imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = gray
      }
      ctx.putImageData(imgData, 0, 0)
      const newTexture = new THREE.Texture(canvas)
      newTexture.needsUpdate = true
      newTexture.colorSpace = THREE.SRGBColorSpace
      return newTexture
    }
    // ------------------------------

    // Load the GLTF model
    const loader = new GLTFLoader()
    loader.load(
      '/objects/asteroid.glb',
      (gltf) => {
        const model = gltf.scene

        // Center the model
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)

        // Scale the model if needed
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 2 / maxDim
        model.scale.set(scale, scale, scale)

        // Apply PBR material with the loaded textures
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            // Ensure geometry has a 2nd UV set for AO if it doesn't already
            const geometry = mesh.geometry as THREE.BufferGeometry
            if (!geometry.attributes.uv2 && geometry.attributes.uv) {
              geometry.setAttribute('uv2', geometry.attributes.uv)
            }
            mesh.material = new THREE.MeshStandardMaterial({
              map: diffuseMap,
              normalMap: normalMap,
              aoMap: ormMap,
              roughness: materialParamsRef.current.roughness,
              metalness: materialParamsRef.current.metalness,
            })
          }
        })

        scene.add(model)
        modelRef.current = model
      },
      (xhr) => {
        // Progress callback - removed console.log to prevent spam
      },
      (error) => {
        console.error('An error happened loading the model', error)
      },
    )

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate)

      // Update lights/material in real time using refs
      if (ambientLightRef.current) {
        let ambColor = ambientParamsRef.current.color
        if (
          typeof ambColor === 'object' &&
          ambColor !== null &&
          'r' in ambColor &&
          'g' in ambColor &&
          'b' in ambColor
        ) {
          ambColor =
            '#' +
            new THREE.Color(
              (ambColor as { r: number; g: number; b: number }).r,
              (ambColor as { r: number; g: number; b: number }).g,
              (ambColor as { r: number; g: number; b: number }).b,
            ).getHexString()
        }
        ambientLightRef.current.color.set(ambColor)
        ambientLightRef.current.intensity = ambientParamsRef.current.intensity
        ambientLightRef.current.position.set(
          ambientParamsRef.current.x,
          ambientParamsRef.current.y,
          ambientParams.z,
        )
      }
      if (directionalLightRef.current) {
        let dirColor = directionalParamsRef.current.color
        if (
          typeof dirColor === 'object' &&
          dirColor !== null &&
          'r' in dirColor &&
          'g' in dirColor &&
          'b' in dirColor
        ) {
          dirColor =
            '#' +
            new THREE.Color(
              (dirColor as { r: number; g: number; b: number }).r,
              (dirColor as { r: number; g: number; b: number }).g,
              (dirColor as { r: number; g: number; b: number }).b,
            ).getHexString()
        }
        directionalLightRef.current.color.set(dirColor)
        directionalLightRef.current.intensity = directionalParamsRef.current.intensity
        directionalLightRef.current.position.set(
          resolveValue(directionalParamsRef.current.x),
          resolveValue(directionalParamsRef.current.y),
          resolveValue(directionalParamsRef.current.z),
        )
      }
      if (modelRef.current) {
        const matParams = materialParamsRef.current
        modelRef.current.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            if (mesh.material && mesh.material instanceof THREE.MeshStandardMaterial) {
              mesh.material.roughness = matParams.roughness
              mesh.material.metalness = matParams.metalness
              mesh.material.needsUpdate = true
            }
          }
        })
      }

      // Handle auto-rotation if enabled
      if (autoRotateRef.current && modelRef.current) {
        if (autoRotateAxesRef.current.includes('x')) {
          spinXRef.current += (autoRotateSpeedXRef.current * Math.PI) / 180
        }
        if (autoRotateAxesRef.current.includes('y')) {
          spinYRef.current += (autoRotateSpeedYRef.current * Math.PI) / 180
        }
        if (autoRotateAxesRef.current.includes('z')) {
          spinZRef.current += (autoRotateSpeedZRef.current * Math.PI) / 180
        }
      }
      // Apply tilt and spin
      if (modelRef.current) {
        let rotationXValue = resolveValue(rotationX)
        let rotationYValue = resolveValue(rotationY)
        let rotationZValue = resolveValue(rotationZ)
        let tiltXValue = resolveValue(tiltX)
        let tiltZValue = resolveValue(tiltZ)
        modelRef.current.rotation.x =
          THREE.MathUtils.degToRad(tiltXValue) +
          THREE.MathUtils.degToRad(rotationXValue) +
          spinXRef.current
        modelRef.current.rotation.y = THREE.MathUtils.degToRad(rotationYValue) + spinYRef.current
        modelRef.current.rotation.z =
          THREE.MathUtils.degToRad(tiltZValue) +
          THREE.MathUtils.degToRad(rotationZValue) +
          spinZRef.current
      }

      renderer.render(scene, camera)
    }

    animate()

    // Handle prop-based resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return
      cameraRef.current.aspect = getAspect()
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(width, width / aspectRatio)
    }
    handleResize()

    // Cleanup
    return () => {
      cancelAnimationFrame(frameIdRef.current)

      if (rendererRef.current) {
        rendererRef.current.dispose()
      }

      // Mouse drag event listeners are disabled
    }
  }, [
    width,
    aspectRatio /*, rotationX, rotationY, rotationZ, tiltX, tiltZ, autoRotate, autoRotateSpeed, autoRotateAxes, autoRotateSpeedX, autoRotateSpeedY, autoRotateSpeedZ*/,
  ])

  return (
    <>
      {/* Leva controls hidden */}
      <div
        ref={containerRef}
        className={className}
        style={{
          width,
          height: width / aspectRatio,
          position: 'relative',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          zIndex: 0,
        }}
        aria-label="3D asteroid model"
      />
    </>
  )
}
