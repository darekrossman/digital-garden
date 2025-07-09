'use client'

import { css } from '@/styled-system/css'
import { useEffect, useRef, useState } from 'react'
import { generateImage } from './inference/image-gen'
import { useGame } from './game-context'
import { Box } from '@/styled-system/jsx'

interface ImageFrameProps {
  prompt?: string | null
  minPixelSize?: number
  onImageRendered?: () => void
}

export function ImageFrame({ prompt, minPixelSize = 6, onImageRendered }: ImageFrameProps) {
  const { theme } = useGame()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const prevPromptRef = useRef<string | null>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

  const fadeTimer = useRef<NodeJS.Timeout | null>(null)

  // Initialize worker and OffscreenCanvas
  const workerRef = useRef<Worker | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isControlTransferredRef = useRef(false)

  // ResizeObserver to watch parent container size
  useEffect(() => {
    const parent = containerRef.current?.parentElement
    const updateSize = () => {
      if (!parent) return

      const { width, height } = parent.getBoundingClientRect()
      setDimensions({ width: Math.floor(width), height: Math.floor(width) })
    }

    window.addEventListener('resize', updateSize)

    updateSize()

    return () => {
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  useEffect(() => {
    if (!dimensions || !canvasRef.current || isControlTransferredRef.current) {
      return
    }

    const worker = new Worker(new URL('./inference/offscreen-worker.ts', import.meta.url), {
      type: 'module',
    })
    workerRef.current = worker

    // Transfer control of the canvas to the worker
    const offscreenCanvas = canvasRef.current.transferControlToOffscreen()
    isControlTransferredRef.current = true
    worker.postMessage(
      {
        type: 'init',
        payload: {
          canvas: offscreenCanvas,
          width: dimensions.width,
          height: dimensions.width,
          targetColor: theme.primary,
        },
      },
      [offscreenCanvas],
    )

    return () => {
      // worker.terminate()
      // workerRef.current = null
      // if (animationFrameRef.current) {
      //   cancelAnimationFrame(animationFrameRef.current)
      // }
    }
  }, [dimensions])

  useEffect(() => {
    if (!dimensions) return

    workerRef.current?.postMessage({
      type: 'config',
      payload: {
        targetColor: theme.primary,
        pixelSize: minPixelSize,
      },
    })
  }, [theme.primary, minPixelSize, dimensions])

  // Update canvas dimensions when they change
  useEffect(() => {
    if (!dimensions) return

    if (canvasRef.current && !isControlTransferredRef.current) {
      canvasRef.current.width = dimensions.width
      canvasRef.current.height = dimensions.width
    }

    // Update worker with new dimensions
    if (workerRef.current && isControlTransferredRef.current) {
      workerRef.current.postMessage({
        type: 'resize',
        payload: {
          width: dimensions.width,
          height: dimensions.height,
        },
      })
      if (img) {
        process({ img })
      }
    }
  }, [dimensions, workerRef.current, isControlTransferredRef.current])

  const clearFadeInterval = () => {
    if (fadeTimer.current) {
      clearInterval(fadeTimer.current)
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }

  const process = ({
    img,
    pixelSize = minPixelSize,
  }: { img?: HTMLImageElement; pixelSize?: number }) => {
    const processFrame = async () => {
      if (!workerRef.current) {
        animationFrameRef.current = requestAnimationFrame(processFrame)
        return
      }
      try {
        if (workerRef.current) {
          const bitmap = await createImageBitmap(img || canvasRef.current!)
          workerRef.current.postMessage({ type: 'frame', payload: { bitmap, pixelSize } }, [bitmap])
        }
      } catch (e) {
        console.error('Error creating ImageBitmap:', e)
      }
    }

    animationFrameRef.current = requestAnimationFrame(processFrame)
  }

  const pixelateFadeIn = (img: HTMLImageElement, startPixelSize = 96) => {
    let pixelSize = startPixelSize

    clearFadeInterval()
    canvasRef.current!.style.opacity = '0.2'
    process({ img, pixelSize })

    fadeTimer.current = setInterval(async () => {
      pixelSize = Math.max(minPixelSize, Math.floor(pixelSize / 2))
      process({ img, pixelSize })
      canvasRef.current!.style.opacity = `${parseFloat(canvasRef.current!.style.opacity) + 0.2}`

      if (pixelSize <= minPixelSize) {
        canvasRef.current!.style.opacity = '1'

        requestAnimationFrame(clearFadeInterval)
        onImageRendered?.()
      }
    }, 150)
  }

  const pixelateFadeOut = () => {
    let pixelSize = minPixelSize * 2

    clearFadeInterval()
    process({ pixelSize })

    fadeTimer.current = setInterval(() => {
      pixelSize = pixelSize * 2
      process({ pixelSize })
      const opacity = parseFloat(canvasRef.current!.style.opacity) - 0.2
      canvasRef.current!.style.opacity = opacity > 0 ? opacity.toString() : '0'

      if (opacity <= 0) {
        canvasRef.current!.style.opacity = '0'
        requestAnimationFrame(clearFadeInterval)
      }
    }, 150)
  }

  const runStream = async (prompt: string) => {
    const { output } = await generateImage(prompt)
    const img = new Image()

    img.src = output
    img.onload = async () => {
      setImg(img)
      pixelateFadeIn(img)
    }
  }

  useEffect(() => {
    if (!prompt || !dimensions) {
      pixelateFadeOut()

      return
    }

    console.log('dimensions', dimensions)

    if (prevPromptRef.current !== prompt) {
      console.log('generate')
      runStream(prompt)
      prevPromptRef.current = prompt
    }
  }, [prompt, dimensions])

  return (
    <Box display="contents" ref={containerRef}>
      {dimensions && (
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.width}
          className={css({
            w: 'full',
            h: 'full',
            imageRendering: 'pixelated',
            objectFit: 'cover',
            filter: 'brightness(1.25)',
          })}
        />
      )}
    </Box>
  )
}
