'use server'

export async function generate(inputs: string) {
  const endpoint = 'https://h6arsy5dk0ti9sz1.us-east-1.aws.endpoints.huggingface.cloud'

  const response = await fetch(endpoint, {
    headers: {
      Accept: 'image/png',
      Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      inputs: inputs,
      parameters: {
        num_inference_steps: 3,
        guidance_scale: 4,
        width: 376,
        height: 376,
      },
    }),
  })

  const blob = await response.blob()
  const buffer = Buffer.from(await blob.arrayBuffer())
  const b64 = buffer.toString('base64')

  return `data:image/png;base64,${b64}`
}
