import { getRandomInt } from '@/lib/helpers'
import { getSystemPrompt } from '@/lib/promptUtils'
import { smoothStream, streamText } from 'ai'

export async function POST(req: Request) {
  const {
    prompt,
    maxTokens,
    systemPrompt,
  }: {
    prompt: string
    maxTokens?: number
    systemPrompt?: string
    model?: string
  } = await req.json()

  const system =
    systemPrompt ||
    `${getSystemPrompt()}\n\nYou never use emojis. You never include confirmation language or follow up questions. You always focus purely on the result and nothing else.`

  const result = streamText({
    model: 'meta/llama-3.1-8b',
    system,
    prompt,
    maxOutputTokens: maxTokens ?? 600,
    temperature: 0.9,
    experimental_transform: smoothStream({
      delayInMs: 10, // optional: defaults to 10ms
      chunking: 'line',
    }),
    onError({ error }) {
      console.error(error)
    },
  })

  return result.toTextStreamResponse()
}
