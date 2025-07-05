'use server'

import { fal } from '@fal-ai/client'
import { createStreamableValue } from 'ai/rsc'

const models = [
  {
    name: 'fal-ai/flux-lora',
    config: {
      image_size: 'square',
      num_inference_steps: 16,
      guidance_scale: 3.5,
      output_format: 'jpeg',
    },
  },
  {
    name: 'fal-ai/hidream-i1-fast',
    config: {
      // image_size: 'square',
      image_size: {
        width: 256,
        height: 256,
      },
      stream: true,
      num_inference_steps: 8,
      output_format: 'jpeg',
    },
  },
]

export async function generateImage(prompt: string) {
  const stream = createStreamableValue('')

  const model = models[1]

  const fullPrompt = `${prompt} Video game-style, pixel-art, high contrast, black and white, noir, chilling.`

  console.log('\n\nGenerating Image ----------------')
  console.log(model)
  console.log()
  console.log(fullPrompt)
  console.log('---------------------------------')

  const run = async () => {
    const result = await fal.stream(model.name, {
      input: {
        prompt: fullPrompt,
        num_images: 1,
        seed: 123,
        enable_safety_checker: false,

        ...model.config,
      },
    })

    for await (const event of result) {
      stream.update(event.images?.[0]?.url)
    }

    stream.done()
  }

  run()

  return { output: stream.value }
}
