'use client'

import { getRandomAdjective, getRandomSymbolicObject } from '@/lib/helpers'
import { css } from '@/styled-system/css'
import { Box, styled } from '@/styled-system/jsx'
import { fal } from '@fal-ai/client'
import { ChatCompletionMessageParam } from 'openai/src/resources.js'
import { useEffect, useRef, useState } from 'react'
import { generate } from './inference/image-gen'

interface ImageFrameProps {
  prompt?: string
  onComplete?: () => void
  regenerateKey?: number
}

fal.config({
  credentials: process.env.NEXT_PUBLIC_FAL_KEY,
})

export function ImageFrame({ prompt, onComplete, regenerateKey }: ImageFrameProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>()

  const currentDrawing = useRef<Uint8Array | null>(null)
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const connection = fal.realtime.connect('fal-ai/fast-lcm-diffusion', {
    throttleInterval: 500,
    onResult(result) {
      if (result.images && result.images[0] && result.images[0].content) {
        const canvas = outputCanvasRef.current
        const context = canvas?.getContext('2d')
        if (canvas && context) {
          const imageBytes: Uint8Array = result.images[0].content
          const blob = new Blob([imageBytes], { type: 'image/png' })
          createImageBitmap(blob)
            .then((bitmap) => {
              context.drawImage(bitmap, 0, 0)
              console.timeEnd(`image generation ${regenerateKey}`)
            })
            .catch(console.error)
        }
      }
    },
    onError: (error) => {
      console.error(error)
    },
  })

  useEffect(() => {
    if (Math.random() < 0.8) {
      return
    }

    const defaultPrompt = `lo-fi, esoteric, techno-code, ${getRandomAdjective()}, black ${getRandomSymbolicObject()} with transparent white background. image should be contained in the bounds of the frame and not be cropped, include stream of machine code, jagged interruptions, strange perspectives.`
    console.log(defaultPrompt)
    console.time(`image generation ${regenerateKey}`)
    connection.send({
      // model_name: 'runwayml/stable-diffusion-v1-5',
      // model_name: 'stabilityai/stable-diffusion-xl-base-1.0',
      prompt: prompt || defaultPrompt,
      num_inference_steps: 6,
      guidance_scale: 2,
      sync_mode: true,
      // seed: 123 + (regenerateKey ?? 0),
      enable_safety_checker: false,
      // format: 'jpeg',
      image_size: {
        width: 1024,
        height: 1024,
      },
    })
  }, [regenerateKey])

  // if (!imageDataUrl) return <Box w="200px" aspectRatio="1/1" />

  return (
    <canvas
      width="1024"
      height="1024"
      className={css({
        w: '160px',
        h: '160px',
        borderRadius: 'full',
        overflow: 'hidden',
        filter: 'grayscale(1)',
      })}
      ref={outputCanvasRef}
    />
  )

  // return <styled.img src={imageDataUrl} alt="Generated" w="200px" aspectRatio="1/1" />
}

// export function ImageFrame({ prompt, onComplete, regenerateKey }: ImageFrameProps) {
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [imageDataUrl, setImageDataUrl] = useState<string | undefined>()

//   const run = async () => {
//     if (isGenerating) {
//       return
//     }

//     const defaultPrompt = `lo-fi, esoteric, techno-code, ${getRandomAdjective()}, black ${getRandomSymbolicObject()} with transparent white background. image should be contained in the bounds of the frame and not be cropped, include stream of machine code, jagged interruptions, strange perspectives.`

//     setIsGenerating(true)
//     // setImageDataUrl(undefined)

//     try {
//       console.log('generate image')
//       const url = await generate(prompt ?? defaultPrompt)
//       setImageDataUrl(url)
//     } catch (error) {
//       console.error('Error generating image:', error)
//     } finally {
//       onComplete?.()
//       setIsGenerating(false)
//     }
//   }

//   useEffect(() => {
//     run()
//   }, [regenerateKey])

//   if (!imageDataUrl) return null

//   return <styled.img src={imageDataUrl} alt="Generated" w="100%" h="100%" />
// }
