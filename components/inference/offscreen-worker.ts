'use client'

import { convertToGrayscale, pixelate } from '@/lib/image-processing'

interface WorkerConfig {
  targetColor?: string
  colorScaleMethod?: 'intensity' | 'interpolation'
  pixelSize?: number
}

// Keep a direct reference to canvas and context
let canvas: OffscreenCanvas | null = null
let ctx: OffscreenCanvasRenderingContext2D | null = null

// Temporary canvas for processing
let tempCanvas: OffscreenCanvas | null = null
let tempCtx: OffscreenCanvasRenderingContext2D | null = null

// Configuration for effects
let config: WorkerConfig = {
  colorScaleMethod: 'interpolation',
  pixelSize: 6,
}

let glitching = false

function applyGlitch() {
  if (!ctx || !canvas) return

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data, width, height } = imageData

  // Apply a few horizontal slices
  for (let i = 0; i < 5; i++) {
    const y = Math.floor(Math.random() * height)
    const h = Math.floor(Math.random() * 10) + 1
    const offset = (Math.floor(Math.random() * 20) - 10) * 4

    for (let row = y; row < y + h && row < height; row++) {
      const rowData = data.subarray(row * width * 4, (row + 1) * width * 4)
      if (offset > 0) {
        const slice = rowData.slice(0, -offset)
        rowData.set(rowData.slice(-offset), 0)
        rowData.set(slice, offset)
      } else if (offset < 0) {
        const slice = rowData.slice(-offset)
        rowData.set(rowData.slice(0, -offset), -offset)
        rowData.set(slice, 0)
      }
    }
  }

  // Randomly change brightness/contrast for a frame
  if (Math.random() > 0.5) {
    const factor = 0.5 + Math.random()
    for (let i = 0; i < data.length; i += 4) {
      data[i] *= factor
      data[i + 1] *= factor
      data[i + 2] *= factor
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

function glitchLoop(frames: number) {
  if (frames <= 0) {
    glitching = false
    return
  }

  applyGlitch()

  setTimeout(() => glitchLoop(frames - 1), 30) // Use setTimeout for controlled frame rate
}

// Main message handler for the worker
self.onmessage = (e: MessageEvent<{ type: string; payload: any }>): void => {
  const { type, payload } = e.data

  switch (type) {
    case 'init': {
      // Initialize main canvas
      canvas = payload.canvas
      ctx = canvas!.getContext('2d', { willReadFrequently: true })!

      // Initialize temporary canvas for processing
      tempCanvas = new OffscreenCanvas(payload.width, payload.height)
      tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!
      break
    }
    case 'config': {
      config = { ...config, ...payload }
      break
    }
    case 'glitch': {
      if (glitching) break
      glitching = true
      glitchLoop(5) // Glitch for 5 frames
      break
    }
    case 'resize': {
      if (!canvas || !ctx) return

      const { width, height } = payload

      // Resize the main canvas
      canvas.width = width
      canvas.height = height

      // Recreate temporary canvas with new dimensions
      tempCanvas = new OffscreenCanvas(width, height)
      tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!
      break
    }
    case 'frame': {
      if (glitching || !ctx || !tempCtx || !tempCanvas) return

      const { bitmap, pixelSize } = payload

      tempCtx.drawImage(bitmap, 0, 0, tempCanvas.width, tempCanvas.height)
      bitmap?.close()

      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
      const processedData = pixelate(
        convertToGrayscale(imageData, config.targetColor, config.colorScaleMethod),
        pixelSize || config.pixelSize!,
      )

      ctx.putImageData(processedData, 0, 0)
      break
    }
  }
}
