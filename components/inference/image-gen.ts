'use server'

import { fal } from '@fal-ai/client'

const models = [
  {
    name: 'fal-ai/flux-lora',
    config: {
      image_size: 'square',
      num_inference_steps: 8,
      guidance_scale: 3.5,
    },
  },
  {
    name: 'fal-ai/flux-1/dev',
    config: {
      image_size: {
        width: 480,
        height: 480,
      },
      num_inference_steps: 16,
      guidance_scale: 3.5,
    },
  },
  {
    name: 'rundiffusion-fal/juggernaut-flux/base',
    config: {
      image_size: {
        width: 256,
        height: 256,
      },
      num_inference_steps: 28,
      guidance_scale: 6.5,
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
    },
  },
  {
    name: 'fal-ai/sana',
    config: {
      image_size: {
        width: 256,
        height: 256,
      },
      num_inference_steps: 25,
      guidance_scale: 6,
      style_name: 'Photographic',
    },
  },
  {
    name: 'fal-ai/lightning-models',
    config: {
      image_size: {
        width: 512,
        height: 512,
      },
      num_inference_steps: 12,
      guidance_scale: 3.5,
      model_name: 'Lykon/dreamshaper-xl-lightning',
      negative_prompt:
        '(worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed, grayscale, bw, bad photo, bad photography, bad art:1.4), (watermark, signature, text font, username, error, logo, words, letters, digits, autograph, trademark, name:1.2), (blur, blurry, grainy), morbid, ugly, asymmetrical, mutated malformed, mutilated, poorly lit, bad shadow, draft, cropped, out of frame, cut off, censored, jpeg artifacts, out of focus, glitch, duplicate, (airbrushed, cartoon, anime, semi-realistic, cgi, render, blender, digital art, manga, amateur:1.3), (3D ,3D Game, 3D Game Scene, 3D Character:1.1), (bad hands, bad anatomy, bad body, bad face, bad teeth, bad arms, bad legs, deformities:1.3)',
      loras: [],
      embeddings: [],
    },
  },
]

export async function generateImage(prompt: string) {
  // const stream = createStreamableValue('')

  const model = models[1]

  const fullPrompt = `${prompt}`

  console.log(model)
  console.log(fullPrompt)

  console.time('generateImage')
  const result = await fal.subscribe(model.name, {
    input: {
      prompt: fullPrompt,
      num_images: 1,
      enable_safety_checker: false,
      output_format: 'jpeg',
      sync_mode: true,
      // seed: 123739873675962,

      ...model.config,
    },
  })
  console.timeEnd('generateImage')

  return { output: result.data.images?.[0]?.url }
}
