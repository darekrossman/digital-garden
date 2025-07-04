import { getRandomInt } from '@/lib/helpers'
import { getSystemPrompt } from '@/lib/promptUtils'
import { openai } from '@ai-sdk/openai'
import { createTogetherAI } from '@ai-sdk/togetherai'
import { smoothStream, streamText } from 'ai'

const models = [
  'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
]

const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_AI_API_KEY ?? '',
})

export async function POST(req: Request) {
  const {
    prompt,
    maxTokens,
    systemPrompt,
  }: {
    prompt: string
    maxTokens?: number
    systemPrompt?: string
  } = await req.json()

  const model = openai('gpt-4.1')
  // const model = togetherai(models[0])

  console.log(model.modelId)

  const result = streamText({
    model,
    system: systemPrompt,
    prompt,
    maxTokens: maxTokens ?? 600,
    temperature: 0.3,
    presencePenalty: 1,
    frequencyPenalty: 1,
    // experimental_transform: smoothStream({
    //   delayInMs: 200,
    // chunking: 'line',
    // }),
    onError({ error }) {
      console.error(error)
    },
  })

  return result.toDataStreamResponse()
}
