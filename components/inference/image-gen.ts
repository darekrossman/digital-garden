'use server'

import { InferenceClient } from '@huggingface/inference'

interface GenerateImageParams {
  numSteps?: number
  guidanceScale?: number
  width?: number
  height?: number
  seed?: number
  numImages?: number
  syncMode?: boolean
  enableSafetyChecker?: boolean
}

export async function generate(
  inputs: string,
  {
    numSteps = 10,
    guidanceScale = 4,
    width = 200,
    height = 200,
    seed = Math.random() * 1000000,
    numImages = 1,
    syncMode = false,
    enableSafetyChecker = false,
  }: GenerateImageParams = {},
): Promise<string> {
  const client = new InferenceClient(process.env.HUGGINGFACE_TOKEN!)

  const image = (await client.textToImage({
    provider: 'fal-ai',
    model: 'black-forest-labs/FLUX.1-dev',
    inputs: inputs,
    parameters: {
      num_inference_steps: numSteps,
      guidance_scale: guidanceScale,
      image_size: {
        width,
        height,
      },
      seed,
      enable_safety_checker: enableSafetyChecker,
      sync_mode: syncMode,
      num_images: numImages,
    },
  })) as unknown as Blob

  const arrayBuffer = await image.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64 = buffer.toString('base64')
  const dataUrl = `data:${image.type};base64,${base64}`

  return dataUrl
}
