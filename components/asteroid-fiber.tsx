'use client'

import { useGLTF } from '@react-three/drei'
import { Canvas, extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { FilmPass, LUTPass, UnrealBloomPass, WaterPass } from 'three-stdlib'
import { AsteroidProps } from './asteroid'

extend({ WaterPass, UnrealBloomPass, FilmPass, LUTPass })

function Scene(props: AsteroidProps) {
  const rockRef = useRef<THREE.Group>(null)
  const lightRef = useRef<THREE.DirectionalLight>(null)
  const light = useRef<THREE.PointLight>(null)
  const ambientLightRef = useRef<THREE.AmbientLight>(null)
  const gl = useThree((state) => state.gl)

  // Set clear color to transparent
  useEffect(() => {
    gl.setClearColor(0x000000, 0) // black with 0 alpha
  }, [gl])

  const [colorMap, normalMap, displacementMap, roughnessMap, aoMap, specularLevelMap, specularMap] =
    useLoader(THREE.TextureLoader, [
      '/textures/Rock Face 03 Diff 1k.png',
      '/textures/Rock Face 03 Normal Gloss 1k.png',
      '/textures/Rock Face 03 Displacement 1k.png',
      '/textures/Rock Face 03 Rough 1k.png',
      '/textures/Rock Face AO 1K.png',
    ])

  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  const setMouse = (mouse: { x: number; y: number }) => {
    mouseRef.current = mouse
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to [0, 1]
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      setMouse({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame((state) => {
    const mouse = mouseRef.current

    // distance from center
    const dx = mouse.x - 0.5
    const dy = mouse.y - 0.5
    const distFromCenter = Math.sqrt(dx * dx + dy * dy) // 0 (center) to ~0.707 (corner)
    console.log(distFromCenter)

    if (rockRef.current) {
      rockRef.current.rotation.y += 0.0002
      rockRef.current.rotation.x += 0.00008
    }

    if (lightRef.current) {
      // Map mouse position to directional light x/y
      // Example: x in [-10, 10], y in [-10, 10]
      // const lightX = (mouse.x - 0.5) * 20
      // const lightY = (0.5 - mouse.y) * 20
      // Map distance to z: at center, z = -20 (far), at edge, z = 0 (close)
      // const lightZ = 1 + dist * -20
      // lightRef.current.position.x = lightX
      // lightRef.current.position.y = lightY
      // lightRef.current.position.z = lightZ
    }
  })

  return (
    <>
      <Model
        ref={rockRef}
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        displacementMap={displacementMap}
        aoMap={aoMap}
        scale={1}
      />

      <ambientLight ref={ambientLightRef} color="white" intensity={0.08} />
      <directionalLight
        ref={lightRef}
        color={props.directionalLight?.color ?? 'white'}
        position={[-300, 500, -200]}
        intensity={15}
      />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.1}
          luminanceSmoothing={0.025}
          intensity={0.9}
          mipmapBlur={true}
          levels={6}
          radius={1}
          lights={[lightRef as any, ambientLightRef as any]}
          selection={[rockRef as any]}
        />
      </EffectComposer>
    </>
  )
}

export interface AsteroidFiberProps extends AsteroidProps {
  /**
   * Optional fixed pixel size for the canvas (square). When provided the
   * asteroid will keep the same visual size regardless of the viewport
   * dimensions. Defaults to `undefined`, which falls back to full-screen.
   */
  size?: number
}

export default function AsteroidFiber(props: AsteroidFiberProps) {
  const { size, ...rest } = props

  const canvasStyle = size
    ? {
        width: `${size}px`,
        height: `${size}px`,
        pointerEvents: 'none' as const,
        filter: 'grayscale(1)',
      }
    : {
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none' as const,
        filter: 'grayscale(1)',
      }

  return (
    <Canvas
      // linear
      flat
      legacy
      style={canvasStyle}
      camera={{ fov: 90, near: 0.1, far: 1000, position: [0, 0, 2] }}
      dpr={[2, 2]}
      shadows={true}
      gl={{
        // alpha: true,
        // premultipliedAlpha: false,
        antialias: true,
      }}
    >
      <Scene {...rest} />
    </Canvas>
  )
}

export function Model({ ref, ...props }: any) {
  const { nodes } = useGLTF('/objects/asteroid.glb')

  return (
    <group {...props} rotation={[0, 45, 0]} dispose={null}>
      <mesh
        ref={ref}
        castShadow
        receiveShadow
        // @ts-ignore
        geometry={nodes.tmpzfbzcugyply.geometry}
      >
        <meshStandardMaterial
          toneMapped={false}
          displacementScale={0}
          map={props.map}
          displacementMap={props.displacementMap}
          normalMap={props.normalMap}
          roughnessMap={props.roughnessMap}
          aoMap={props.aoMap}
          roughness={0.9}
          metalness={0.2}
        />
      </mesh>
    </group>
  )
}

useGLTF.preload('/objects/asteroid.glb')
