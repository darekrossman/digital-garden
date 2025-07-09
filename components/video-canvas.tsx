'use client'

import { css } from '@/styled-system/css'
import { useEffect, useRef, useState, SyntheticEvent } from 'react'
import { Box } from '@/styled-system/jsx'
import { useGame } from './game-context'

interface VideoCanvasProps {
  src: string
  targetColor?: string
  colorScaleMethod?: 'intensity' | 'interpolation'
  pixelSize?: number
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  onVideoLoaded?: () => void
  onVideoError?: (error: SyntheticEvent<HTMLVideoElement>) => void
  className?: string
}

export function VideoCanvas({
  src,
  targetColor,
  colorScaleMethod = 'intensity',
  pixelSize = 4,
  autoPlay = true,
  loop = true,
  muted = true,
  onVideoLoaded,
  onVideoError,
  className,
}: VideoCanvasProps) {
  const { theme } = useGame()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isControlTransferredRef = useRef(false)

  const effectiveTargetColor = targetColor || theme.primary

  // Initialize worker and OffscreenCanvas
  useEffect(() => {
    if (!canvasRef.current || isControlTransferredRef.current) return

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
          width: canvasRef.current.width,
          height: canvasRef.current.height,
        },
      },
      [offscreenCanvas],
    )

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  // Send config updates to worker
  useEffect(() => {
    workerRef.current?.postMessage({
      type: 'config',
      payload: {
        targetColor: effectiveTargetColor,
        colorScaleMethod,
        pixelSize,
      },
    })
  }, [effectiveTargetColor, colorScaleMethod, pixelSize])

  // Main processing loop, runs on the main thread but offloads work
  const processFrame = async () => {
    const video = videoRef.current
    if (!video || video.paused || video.ended || !workerRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame)
      return
    }

    try {
      // Create a lightweight ImageBitmap from the video frame
      const bitmap = await createImageBitmap(video)
      // Transfer the bitmap to the worker for processing
      workerRef.current.postMessage({ type: 'frame', payload: { bitmap } }, [bitmap])
    } catch (e) {
      console.error('Error creating ImageBitmap:', e)
    }

    // Continue the loop
    animationFrameRef.current = requestAnimationFrame(processFrame)
  }

  // Start/stop processing
  const handleVideoPlay = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    processFrame()
  }

  const handleVideoPause = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }

  const handleVideoLoad = () => {
    onVideoLoaded?.()
  }

  const handleVideoError = (error: SyntheticEvent<HTMLVideoElement>) => {
    console.error('Video loading error:', error)
    onVideoError?.(error)
  }

  const handleVideoEnd = () => {
    if (loop) {
      // Tell worker to apply glitch effect
      workerRef.current?.postMessage({ type: 'glitch' })

      // Restart video shortly after, to allow glitch effect to play
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0 // Reset time
          videoRef.current.play()
        }
      }, 150) // Glitch duration
    } else {
      handleVideoPause() // Original behavior if not looping
    }
  }

  // Cleanup animation frame on unmount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.25
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <Box w="full" h="full" position="relative" className={className}>
      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        loop={false}
        muted={muted}
        playsInline
        onLoadedData={handleVideoLoad}
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        style={{
          // display: 'none'
          position: 'absolute',
        }}
      />

      {/* Canvas for rendering processed video */}
      <canvas
        ref={canvasRef}
        width="256"
        height="256"
        className={css({
          w: 'full',
          h: 'full',
          imageRendering: 'pixelated',
          objectFit: 'cover',
          filter: 'brightness(1.1) contrast(1.1)',
        })}
      />
    </Box>
  )
}
