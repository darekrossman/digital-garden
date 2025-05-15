'use server'

import { InferenceClient } from '@huggingface/inference'

export async function generate(inputs: string) {
  const client = new InferenceClient(process.env.HUGGINGFACE_TOKEN)

  const imageResponse = await client.textToImage({
    provider: 'nebius',
    model: 'black-forest-labs/FLUX.1-dev',
    inputs: inputs,
    parameters: { num_inference_steps: 3 },
    temperature: 0.9,
  })

  const image = imageResponse as unknown as Blob

  // Convert Blob to ArrayBuffer
  const arrayBuffer = await image.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64 = buffer.toString('base64')
  const mimeType = image.type // e.g., 'image/jpeg'
  const dataUrl = `data:${mimeType};base64,${base64}`

  return dataUrl
}
