'use client'

import { css } from '@/styled-system/css'
import { readStreamableValue } from 'ai/rsc'
import { useEffect, useRef, useState } from 'react'
import { generateImage } from './inference/image-gen'

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
}

// Grayscale conversion function
function convertToGrayscale(imageData: ImageData): ImageData {
  const { data, width, height } = imageData
  const newData = new Uint8ClampedArray(data.length)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    // Use luminance formula for grayscale conversion
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)

    newData[i] = gray // R
    newData[i + 1] = gray // G
    newData[i + 2] = gray // B
    newData[i + 3] = a // A (alpha)
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

export function ImageFrame({ prompt }: ImageFrameProps) {
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null)
  const renderCountRef = useRef(1)

  const fadeTimer = useRef<NodeJS.Timeout | null>(null)
  const fadeTick = useRef(1)
  const pixelSize = useRef(48)

  const minPixelSize = 8

  const clearFadeInterval = () => {
    if (fadeTimer.current) {
      clearInterval(fadeTimer.current)
    }
  }

  const process = (pixelSize: number) => {
    const canvas = outputCanvasRef.current!
    const context = canvasContextRef.current!
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const data = pixelate(convertToGrayscale(imageData), pixelSize)
    context.putImageData(data, 0, 0)
  }

  const runStream = async (prompt: string) => {
    console.time('runStream')
    const { output } = await generateImage(prompt)
    console.timeEnd('runStream')

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
    <canvas
      width="1024"
      height="1024"
      className={css({
        w: 'full',
        h: 'full',
        imageRendering: 'pixelated',
      })}
      ref={outputCanvasRef}
    />
  )
}
