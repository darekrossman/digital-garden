'use client'

import { css } from '@/styled-system/css'
import { readStreamableValue } from 'ai/rsc'
import { useEffect, useRef, useState } from 'react'
import { generateImage } from './inference/image-gen'
import { Box } from '@/styled-system/jsx'
import { useGame } from './game-context'

/**
 * ImageFrame Component - Enhanced with Color Scaling
 *
 * This component can now convert images to different color scales instead of just grayscale.
 *
 * Examples:
 *
 * // Original grayscale (default)
 * <ImageFrame prompt="a cat" />
 *
 * // Orange color scale using intensity method
 * <ImageFrame
 *   prompt="a cat"
 *   targetColor="rgba(255, 165, 0, 1)"
 *   colorScaleMethod="intensity"
 * />
 *
 * // Blue color scale using interpolation method
 * <ImageFrame
 *   prompt="a cat"
 *   targetColor="#0066ff"
 *   colorScaleMethod="interpolation"
 * />
 *
 * // Purple color scale with CSS color name
 * <ImageFrame
 *   prompt="a cat"
 *   targetColor="purple"
 *   colorScaleMethod="intensity"
 * />
 *
 * Color Scale Methods:
 * - 'intensity': Multiplies target color by luminance intensity (more vibrant darks)
 * - 'interpolation': Linear interpolation from black to target color (smoother gradient)
 */

interface ImageFrameProps {
  prompt?: string | null
  onComplete?: () => void
  regenerateKey?: number
  pixelSize?: number
  ditherStrength?: number
  whiteLevel?: number
  blackLevel?: number
  grayLevel?: number
  ditheringAlgorithm?: 'floyd-steinberg' | 'ordered'
  onImageRendered?: () => void
}

// Color parsing utility
function parseColor(colorString: string): { r: number; g: number; b: number; a: number } {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  // Use canvas to parse any CSS color format
  ctx.fillStyle = colorString
  const computedColor = ctx.fillStyle

  // Handle hex colors
  if (computedColor.startsWith('#')) {
    const hex = computedColor.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return { r, g, b, a: 255 }
  }

  // Handle rgb/rgba colors
  const match = computedColor.match(/rgba?\(([^)]+)\)/)
  if (match) {
    const values = match[1].split(',').map((v) => parseFloat(v.trim()))
    return {
      r: values[0] || 0,
      g: values[1] || 0,
      b: values[2] || 0,
      a: values[3] !== undefined ? Math.round(values[3] * 255) : 255,
    }
  }

  // Fallback to black
  return { r: 0, g: 0, b: 0, a: 255 }
}

// Enhanced grayscale/color scale conversion function
function convertToGrayscale(
  imageData: ImageData,
  targetColor?: string,
  method: 'intensity' | 'interpolation' = 'intensity',
): ImageData {
  const { data, width, height } = imageData
  const newData = new Uint8ClampedArray(data.length)

  let targetRGB: { r: number; g: number; b: number; a: number } | null = null
  if (targetColor) {
    targetRGB = parseColor(targetColor)
  }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    // Calculate luminance using standard formula
    const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b)

    if (!targetRGB) {
      // Original grayscale behavior
      newData[i] = luminance // R
      newData[i + 1] = luminance // G
      newData[i + 2] = luminance // B
      newData[i + 3] = a // A
    } else {
      // Apply color scaling
      const intensity = luminance / 255 // Normalize to 0-1

      if (method === 'intensity') {
        // Solution 1: Color Intensity Scaling
        // Multiply target color by luminance intensity
        newData[i] = Math.round(targetRGB.r * intensity) // R
        newData[i + 1] = Math.round(targetRGB.g * intensity) // G
        newData[i + 2] = Math.round(targetRGB.b * intensity) // B
        newData[i + 3] = a // A
      } else {
        // Solution 2: Linear Interpolation
        // Interpolate between black (0,0,0) and target color
        newData[i] = Math.round(0 + (targetRGB.r - 0) * intensity) // R
        newData[i + 1] = Math.round(0 + (targetRGB.g - 0) * intensity) // G
        newData[i + 2] = Math.round(0 + (targetRGB.b - 0) * intensity) // B
        newData[i + 3] = a // A
      }
    }
  }

  return new ImageData(newData, width, height)
}

// Pixelation function
function pixelate(imageData: ImageData, pixelSize: number): ImageData {
  const { data, width, height } = imageData
  const newData = new Uint8ClampedArray(data.length)

  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      // Get the color of the top-left pixel of this block
      const i = (y * width + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      // Fill the entire block with this color
      for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
        for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
          const targetI = ((y + dy) * width + (x + dx)) * 4
          newData[targetI] = r
          newData[targetI + 1] = g
          newData[targetI + 2] = b
          newData[targetI + 3] = a
        }
      }
    }
  }

  return new ImageData(newData, width, height)
}

export function ImageFrame({ prompt, onImageRendered }: ImageFrameProps) {
  const { theme } = useGame()
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null)
  const renderCountRef = useRef(1)

  const fadeTimer = useRef<NodeJS.Timeout | null>(null)
  const fadeTick = useRef(1)
  const pixelSize = useRef(48)

  const minPixelSize = 6

  const clearFadeInterval = () => {
    if (fadeTimer.current) {
      clearInterval(fadeTimer.current)
    }
  }

  const process = (pixelSize: number) => {
    const canvas = outputCanvasRef.current!
    const context = canvasContextRef.current!
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const data = pixelate(convertToGrayscale(imageData, theme.primary, 'intensity'), pixelSize)
    context.putImageData(data, 0, 0)
  }

  const runStream = async (prompt: string) => {
    const { output } = await generateImage(prompt)

    const canvas = outputCanvasRef.current!
    const context = canvasContextRef.current!
    const img = new Image()

    img.src = output
    img.onload = () => {
      clearFadeInterval()

      outputCanvasRef.current!.style.opacity = '0.2'

      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(img, 0, 0, canvas.width, canvas.height)

      pixelSize.current = 96
      process(pixelSize.current)

      fadeTimer.current = setInterval(() => {
        context.drawImage(img, 0, 0, canvas.width, canvas.height)
        pixelSize.current = Math.max(minPixelSize, Math.floor(pixelSize.current / 2))
        process(pixelSize.current)
        outputCanvasRef.current!.style.opacity = `${parseFloat(outputCanvasRef.current!.style.opacity) + 0.2}`

        if (pixelSize.current <= minPixelSize) {
          outputCanvasRef.current!.style.opacity = '1'
          clearFadeInterval()
          onImageRendered?.()
        }
      }, 150)
    }
  }

  useEffect(() => {
    const context = outputCanvasRef.current?.getContext('2d', { willReadFrequently: true }) || null
    canvasContextRef.current = context
  }, [])

  useEffect(() => {
    if (!prompt) {
      clearFadeInterval()

      fadeTick.current = 1

      fadeTimer.current = setInterval(() => {
        process(minPixelSize + 2 * fadeTick.current)
        outputCanvasRef.current!.style.opacity = `${1 - fadeTick.current / 10}`
        fadeTick.current++
      }, 150)

      return
    }

    runStream(prompt)
  }, [prompt])

  return (
    <Box w="full" h="full">
      <canvas
        width="1024"
        height="1024"
        className={css({
          w: 'full',
          h: 'full',
          imageRendering: 'pixelated',
          objectFit: 'cover',
          filter: 'brightness(1.1)',
        })}
        ref={outputCanvasRef}
      />
    </Box>
  )
}
