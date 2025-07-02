'use client'

import { useGLTF } from '@react-three/drei'
import { Canvas, extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  Bloom,
  EffectComposer,
  Noise,
  SelectiveBloom,
  ToneMapping,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { useEffect, useRef, useState } from 'react'
import { AmbientLight, DirectionalLight, Group, PerspectiveCamera, TextureLoader } from 'three'
import { Mesh } from 'three'
import { FilmPass, LUTPass, ShaderPass, UnrealBloomPass, WaterPass } from 'three-stdlib'
import { degToRad } from 'three/src/math/MathUtils.js'
import { AsteroidProps } from './asteroid'

extend({ WaterPass, UnrealBloomPass, FilmPass, LUTPass })

function Scene(props: AsteroidProps & { size?: number }) {
  const rockRef = useRef<Group>(null)
  const lightRef = useRef<DirectionalLight>(null)
  const ambientLightRef = useRef<AmbientLight>(null)
  const { viewport, camera } = useThree()

  const [initialHeight, setInitialHeight] = useState(0)

  useEffect(() => {
    setInitialHeight(window.innerHeight)
  }, [])

  useEffect(() => {
    // const c = camera as PerspectiveCamera
    // c.fov = (window.innerHeight / initialHeight) * 30
    // c.aspect = window.innerWidth / window.innerHeight

    lightRef.current!.shadow.camera.far = 3000
  }, [viewport])

  const [colorMap, normalMap, displacementMap, roughnessMap, aoMap, specularLevelMap, specularMap] =
    useLoader(TextureLoader, [
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

    // Distance and direction from the centre (-0.5 → 0.5 range)
    const dx = mouse.x - 0.5 // –0.5 (left) → 0.5 (right)
    const dy = mouse.y - 0.5 // –0.5 (top)  → 0.5 (bottom)
    const distFromCenter = Math.sqrt(dx * dx + dy * dy) // 0 (centre) → ~0.707 (corner)

    // Tune how aggressively the mouse influences the rotation
    const MAX_SPEED = 0.003 // radians / frame at furthest corner
    const speed = distFromCenter * MAX_SPEED

    if (rockRef.current) {
      rockRef.current.rotation.y += MAX_SPEED
      rockRef.current.rotation.z += dy * speed * 2
    }

    if (lightRef.current) {
      lightRef.current.position.x = dx * 50
    }
  })

  const modelScale = 0.22

  return (
    <>
      <ambientLight ref={ambientLightRef} color="white" intensity={0.08} />
      <directionalLight
        ref={lightRef}
        color={props.directionalLight?.color ?? 'white'}
        position={[0, 490, 0]}
        intensity={15}
        castShadow
        shadow-mapSize={[4056, 4056]}
      />

      <Model
        ref={rockRef}
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        displacementMap={displacementMap}
        aoMap={aoMap}
        scale={modelScale}
      />

      {/* <Shadows position={[0, -0.3, 0]} rotation={[-degToRad(90), 0, 0]} /> */}

      {/* <fog color="#161616" attach="fog" near={8} far={30} args={[0, 0, 0]} /> */}

      <EffectComposer multisampling={8}>
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <SelectiveBloom
          luminanceThreshold={0.1}
          luminanceSmoothing={0.025}
          intensity={0.9}
          mipmapBlur={true}
          levels={6}
          radius={1}
          lights={[lightRef as any, ambientLightRef as any]}
          selection={[rockRef as any]}
        />
        <Noise opacity={0.1} />
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

  const canvasStyle = {
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
      camera={{
        fov: 30,
        near: 0.1,
        far: 3000,
        position: [0, 0, 2],
      }}
      dpr={[2, 2]}
      shadows={true}
      gl={{
        // alpha: true,
        // premultipliedAlpha: false,
        antialias: true,
      }}
    >
      <Scene {...rest} size={size} />
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
        // receiveShadow
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

function Box(props: any) {
  const ref = useRef<Mesh>(null)
  const [hovered, hover] = useState(false)
  return (
    <mesh
      {...props}
      castShadow
      ref={ref}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

function Shadows(props: any) {
  const { viewport } = useThree()
  return (
    <mesh receiveShadow scale={[viewport.width, viewport.height, 1]} {...props}>
      <planeGeometry />
      <shadowMaterial opacity={0.4} transparent={true} />
      {/* <meshPhongMaterial color="#FFFFFF" /> */}
    </mesh>
  )
}

useGLTF.preload('/objects/asteroid.glb')
