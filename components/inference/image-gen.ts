'use server'

import { InferenceClient } from '@huggingface/inference'

export async function generate(inputs: string) {
  const client = new InferenceClient(process.env.HUGGINGFACE_TOKEN!)

  const image = (await client.textToImage({
    provider: 'fal-ai',
    model: 'black-forest-labs/FLUX.1-dev',
    inputs: inputs,
    parameters: {
      num_inference_steps: 10,
      guidance_scale: 4,
      image_size: {
        width: 200,
        height: 200,
      },
      seed: -1,
      // enable_safety_checker: false,
    },
  })) as unknown as Blob

  const arrayBuffer = await image.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64 = buffer.toString('base64')
  const dataUrl = `data:${image.type};base64,${base64}`

  return dataUrl
}
