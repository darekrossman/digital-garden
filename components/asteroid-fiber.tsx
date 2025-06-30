'use client'

import { AsciiRenderer, Effects, Outlines, useGLTF } from '@react-three/drei'
import { Canvas, extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Grid,
  Noise,
  Scanline,
  Select,
  SelectiveBloom,
} from '@react-three/postprocessing'
import { MotionValue, useTime } from 'motion/react'
import { BlendFunction } from 'postprocessing'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { FilmPass, LUTCubeLoader, LUTPass, UnrealBloomPass, WaterPass } from 'three-stdlib'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { AsteroidProps } from './asteroid'
import { ImageFrame } from './image-frame'

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
    if (rockRef.current) {
      rockRef.current.rotation.y += 0.0001
      rockRef.current.rotation.x += 0.00002
    }

    // state.gl.setClearColor(0x000000, 0)

    // if (lightRef.current) {
    //   const mouse = mouseRef.current
    //   // Map mouse position to directional light x/y
    //   // Example: x in [-10, 10], y in [-10, 10]
    //   const lightX = (mouse.x - 0.5) * 20
    //   const lightY = (0.5 - mouse.y) * 20
    //   // Calculate distance from center (0 = center, sqrt(0.5^2 + 0.5^2) = corner)
    //   const dx = mouse.x - 0.5
    //   const dy = mouse.y - 0.5
    //   const dist = Math.sqrt(dx * dx + dy * dy) // 0 (center) to ~0.707 (corner)
    //   // Map distance to z: at center, z = -20 (far), at edge, z = 0 (close)
    //   const lightZ = 1 + dist * -20

    //   lightRef.current.position.x = lightX
    //   lightRef.current.position.y = lightY
    //   lightRef.current.position.z = lightZ
    // }
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

      <ambientLight ref={ambientLightRef} color="white" intensity={0.1} />
      <directionalLight
        ref={lightRef}
        color={props.directionalLight?.color ?? 'white'}
        position={[-6, 30, -20]}
        intensity={16}
      />

      <EffectComposer>
        <SelectiveBloom
          luminanceThreshold={0.1}
          luminanceSmoothing={0.1}
          intensity={1}
          mipmapBlur={true}
          levels={3}
          radius={1}
          lights={[lightRef as any]}
          selection={[rockRef as any]}
        />

        {/* <Scanline density={1.25} blendFunction={BlendFunction.SCREEN} /> */}
      </EffectComposer>

      {/* <Postpro /> */}
    </>
  )
}

export default function AsteroidFiber(props: AsteroidProps) {
  return (
    <Canvas
      // linear
      flat
      legacy
      style={{ width: '100vw', height: '100vh', pointerEvents: 'none', filter: 'grayscale(1)' }}
      camera={{ fov: 90, near: 0.1, far: 1000, position: [0, 0, 2] }}
      dpr={[2, 2]}
      shadows={true}
      gl={{
        // alpha: true,
        // premultipliedAlpha: false,
        antialias: true,
      }}
    >
      <Scene {...props} />
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
          // roughness={2}
          // metalness={0.1}
        />
      </mesh>
    </group>
  )
}

useGLTF.preload('/objects/asteroid.glb')

function Postpro() {
  const water = useRef<any>(null)
  const data = useLoader(LUTCubeLoader, '/objects/cubicle.CUBE')
  // useFrame((state) => (water.current!.time = state.clock.elapsedTime * 4))
  return (
    <Effects disableGamma>
      {/* <waterPass ref={water} factor={1} /> */}
      {/* @ts-ignore */}
      {/* <unrealBloomPass args={[undefined, 0.8, 1, 0.1]} oldClearAlpha={1} /> */}
      {/* @ts-ignore */}
      <filmPass args={[0.4, 0.5, 1500, false]} />
      {/* @ts-ignore */}
      {/* <lUTPass lut={data.texture} intensity={1} /> */}
    </Effects>
  )
}
