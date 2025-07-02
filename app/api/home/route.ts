import { getRandomInt } from '@/lib/helpers'
import { getSystemPrompt } from '@/lib/promptUtils'
import { openai } from '@ai-sdk/openai'
import { createTogetherAI } from '@ai-sdk/togetherai'
import { smoothStream, streamText } from 'ai'

const models = [
  // 'Qwen/Qwen2.5-7B-Instruct-Turbo',
  'meta-llama/Meta-Llama-3-8B-Instruct-Lite',
  'meta-llama/Llama-3.2-3B-Instruct-Turbo',
  'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
  'meta-llama/Llama-4-Scout-17B-16E-Instruct',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  // 'mistralai/Mistral-7B-Instruct-v0.2',
  // 'Qwen/Qwen2.5-Coder-32B-Instruct',
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

  console.log(model.modelId)

  const result = streamText({
    model,
    system: systemPrompt,
    prompt,
    maxTokens: maxTokens ?? 600,
    temperature: 0.9,
    // experimental_transform: smoothStream({
    //   delayInMs: 10,
    //   chunking: 'line',
    // }),
    onError({ error }) {
      console.error(error)
    },
  })

  return result.toDataStreamResponse()
}
