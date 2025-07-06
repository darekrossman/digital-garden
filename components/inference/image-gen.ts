'use server'

import { fal } from '@fal-ai/client'
import { createStreamableValue } from 'ai/rsc'

const models = [
  {
    name: 'fal-ai/flux-lora',
    config: {
      image_size: 'square',
      num_inference_steps: 8,
      guidance_scale: 3.5,
      output_format: 'jpeg',
    },
  },
  {
    name: 'fal-ai/flux/schnell',
    config: {
      image_size: {
        width: 256,
        height: 256,
      },
      num_inference_steps: 12,
      output_format: 'jpeg',
      sync_mode: true,
    },
  },
  {
    name: 'rundiffusion-fal/juggernaut-flux/lightning',
    config: {
      image_size: {
        width: 256,
        height: 256,
      },
      num_inference_steps: 12,
      // guidance_scale: 3.5,
      output_format: 'jpeg',
      sync_mode: true,
    },
  },
  {
    name: 'fal-ai/hidream-i1-fast',
    config: {
      image_size: {
        width: 256,
        height: 256,
      },
      num_inference_steps: 8,
      output_format: 'jpeg',
    },
  },
]

export async function generateImage(prompt: string) {
  // const stream = createStreamableValue('')

  const model = models[2]

  const fullPrompt = `${prompt} Artistic, illustrated, noir, chilling.`

  console.time('generateImage')
  const result = await fal.subscribe(model.name, {
    input: {
      prompt: fullPrompt,
      num_images: 1,
      seed: 123,
      enable_safety_checker: false,

      ...model.config,
    },
  })
  console.timeEnd('generateImage')

  return { output: result.data.images?.[0]?.url }
}
