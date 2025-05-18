'use client'

import { getRandomAdjective, getRandomSymbolicObject } from '@/lib/helpers'
import { Box, styled } from '@/styled-system/jsx'
import { ChatCompletionMessageParam } from 'openai/src/resources.js'
import { useEffect, useState } from 'react'
import { generate } from './inference/image-gen'

interface ImageFrameProps {
  prompt?: string
  onComplete?: () => void
  regenerateKey?: string | number
}

export function ImageFrame({ prompt, onComplete, regenerateKey }: ImageFrameProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>()

  const run = async () => {
    if (isGenerating) {
      return
    }

    const defaultPrompt = `lo-fi, esoteric, techno-code, ${getRandomAdjective()}, black ${getRandomSymbolicObject()} with transparent white background. image should be contained in the bounds of the frame and not be cropped, include stream of machine code, jagged interruptions, strange perspectives.`

    setIsGenerating(true)
    setImageDataUrl(undefined)

    try {
      console.log('generate image')
      const url = await generate(prompt ?? defaultPrompt)
      setImageDataUrl(url)
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      onComplete?.()
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    run()
  }, [regenerateKey])

  if (!imageDataUrl) return null

  return <styled.img src={imageDataUrl} alt="Generated" w="100%" h="100%" />
}
