'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const WireframeCity: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = null // Set to null for transparency

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )
    camera.position.set(25, 10, 25) // Position further away for better background view
    camera.lookAt(0, 0, 0)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // Enable transparency
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0) // Set clear color to transparent
    mountRef.current.appendChild(renderer.domElement)

    // Create wireframe material - transparent with only lines visible
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff, // Cyan color for the wireframe
      transparent: true,
      opacity: 0.15, // Much more subtle opacity for background use
    })

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100, 20, 20) // Larger ground plane
    const groundWireframe = new THREE.WireframeGeometry(groundGeometry)
    const groundLines = new THREE.LineSegments(groundWireframe, wireframeMaterial)
    groundLines.rotation.x = -Math.PI / 2 // Rotate to horizontal plane
    scene.add(groundLines)

    // Create a custom grid instead of using GridHelper to avoid type issues
    const gridSize = 100
    const gridDivisions = 20
    const gridStep = gridSize / gridDivisions
    const gridGeometry = new THREE.BufferGeometry()
    const gridVertices = []

    // Create grid lines
    for (let i = -gridSize / 2; i <= gridSize / 2; i += gridStep) {
      // X axis lines
      gridVertices.push(i, 0, -gridSize / 2)
      gridVertices.push(i, 0, gridSize / 2)

      // Z axis lines
      gridVertices.push(-gridSize / 2, 0, i)
      gridVertices.push(gridSize / 2, 0, i)
    }

    gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridVertices, 3))

    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.1,
    })

    const grid = new THREE.LineSegments(gridGeometry, gridMaterial)
    grid.position.y = 0.01 // Slight offset to prevent z-fighting
    scene.add(grid)

    // Function to create a building
    const createBuilding = (x: number, z: number, width: number, depth: number, height: number) => {
      const buildingGeometry = new THREE.BoxGeometry(width, height, depth)
      const edges = new THREE.EdgesGeometry(buildingGeometry)
      const building = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.2, // More subtle for background use
        }),
      )
      building.position.set(x, height / 2, z) // Position from center of building's base
      scene.add(building)
      return building
    }

    // Create city buildings - more spread out
    const buildings: THREE.LineSegments[] = []
    const citySize = 10 // Larger city
    const spacing = 8 // More spacing

    for (let x = -citySize; x <= citySize; x++) {
      for (let z = -citySize; z <= citySize; z++) {
        // Skip some positions randomly to create varied city layout
        if (Math.random() > 0.5) continue // Skip more buildings for a sparser look

        const width = 1 + Math.random() * 3
        const depth = 1 + Math.random() * 3
        const height = 1 + Math.random() * 15 // Taller buildings for more dramatic effect
        const building = createBuilding(x * spacing, z * spacing, width, depth, height)
        buildings.push(building)
      }
    }

    // Group for entire city
    const cityGroup = new THREE.Group()
    cityGroup.add(groundLines)
    cityGroup.add(grid)
    buildings.forEach((building) => cityGroup.add(building))
    scene.add(cityGroup)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Slowly rotate the entire city
      cityGroup.rotation.y += 0.0005

      renderer.render(scene, camera)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return
      const width = window.innerWidth
      const height = window.innerHeight

      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    window.addEventListener('resize', handleResize)

    // Cleanup function
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement)
      }
      window.removeEventListener('resize', handleResize)
      // Dispose of geometries and materials
      groundWireframe.dispose()
      gridGeometry.dispose()
      gridMaterial.dispose()
      buildings.forEach((building) => {
        if (building.geometry) building.geometry.dispose()
        if (building.material) {
          if (Array.isArray(building.material)) {
            building.material.forEach((material) => material.dispose())
          } else {
            building.material.dispose()
          }
        }
      })
    }
  }, [])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}

export default WireframeCity
