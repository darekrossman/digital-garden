import { useGame } from './game-context'
import { useEffect, useRef } from 'react'
import { css } from '@/styled-system/css'
import { convertToGrayscale, pixelate } from '@/lib/image-processing'

export const ImageCanvas = ({
  src,
  width = 64,
  height = 64,
  minPixelSize = 2,
}: { src: string; width?: number; height?: number; minPixelSize?: number }) => {
  const { theme } = useGame()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => {
      const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true })
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        const imageData = ctx.getImageData(0, 0, width, height)
        const processedData = pixelate(convertToGrayscale(imageData, theme.primary), minPixelSize)
        ctx.putImageData(processedData, 0, 0)
      }
    }
  }, [src])

  return (
    <canvas
      width={width}
      height={height}
      ref={canvasRef}
      className={css({
        filter: 'brightness(1.3)',
      })}
    />
  )
}
