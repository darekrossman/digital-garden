'use client'

import { getRandomAdjective, getRandomSymbolicObject } from '@/lib/helpers'
import { Box } from '@/styled-system/jsx'
import { ChatCompletionMessageParam } from 'openai/src/resources.js'
import { useCallback, useEffect, useState } from 'react'
import { generate } from './inference/image-gen'

interface ImageFrameProps {
  messages?: ChatCompletionMessageParam[]
  onComplete?: () => void
  regenerateKey?: string | number
}

export function ImageFrame({ messages, onComplete, regenerateKey }: ImageFrameProps) {
  const [previousGeneration, setPreviousGeneration] = useState<string>('')
  const [currentGeneration, setCurrentGeneration] = useState<string>('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>()

  const run = async () => {
    if (isGenerating) {
      console.log('already generating')
      return
    }

    const prompt = `lo-fi, esoteric, techno-code, ${getRandomAdjective()}, black ${getRandomSymbolicObject()} with transparent white background. image should be contained in the bounds of the frame and not be cropped.`

    // const prompt = messages?.[0]?.content

    setIsGenerating(true)
    setImageDataUrl(undefined)

    try {
      console.log('generate image')
      const url = await generate(prompt as string)
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

  return <img src={imageDataUrl} alt="Generated" style={{ width: '100%', height: '100%' }} />
}
