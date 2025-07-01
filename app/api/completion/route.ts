import { getRandomInt } from '@/lib/helpers'
import { getSystemPrompt } from '@/lib/promptUtils'
import { openai } from '@ai-sdk/openai'
import { createTogetherAI } from '@ai-sdk/togetherai'
import { streamText } from 'ai'

// const models = [
//   'Qwen/Qwen2.5-7B-Instruct-Turbo',
//   'meta-llama/Meta-Llama-3-8B-Instruct-Lite',
//   'meta-llama/Llama-3.2-3B-Instruct-Turbo',
//   'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
//   'meta-llama/Llama-4-Scout-17B-16E-Instruct',
//   'meta-llama/Llama-3.3-70B-Instruct-Turbo',
//   'mistralai/Mistral-7B-Instruct-v0.2',
//   'Qwen/Qwen2.5-Coder-32B-Instruct',
//   'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
// ]

// const togetherai = createTogetherAI({
//   apiKey: process.env.TOGETHER_AI_API_KEY ?? '',
// })

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json()

  const system = `NO EMOJIS EVER. ${getSystemPrompt()}\n\n# Instructions\nNever use emojis ever. Never include confirmation language or additional questions. Make use of h1 and h2 markdown when needed.`

  const result = streamText({
    model: openai('gpt-4.1-nano'),
    system,
    prompt,
    maxTokens: 600,
    temperature: 0.6,
    // presencePenalty: 1.5,
    frequencyPenalty: 1.5,
    onError({ error }) {
      console.error(error) // your error logging logic here
    },
  })

  return result.toDataStreamResponse()
}
