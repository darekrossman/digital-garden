'use server'

import { fal } from '@fal-ai/client'

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
    numSteps = 6,
    guidanceScale = 1.5,
    width = 1024,
    height = 1024,
    seed = Math.random() * 1000000,
    numImages = 1,
    syncMode = false,
    enableSafetyChecker = false,
  }: GenerateImageParams = {},
): Promise<string> {
  console.log('generating image', inputs)

  const result = await fal.subscribe('fal-ai/fast-lcm-diffusion', {
    input: {
      model_name: 'stabilityai/stable-diffusion-xl-base-1.0',
      prompt: inputs,
      num_inference_steps: numSteps,
      guidance_scale: guidanceScale,
      sync_mode: true,
      num_images: 1,
      enable_safety_checker: false,
      format: 'jpeg',
      image_size: {
        width,
        height,
      },
    },
  })

  return result.data.images[0].url
}
