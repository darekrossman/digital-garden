import { rpgSchema } from '@/lib/rpg-schemas'
import { createOpenAI } from '@ai-sdk/openai'
import { streamObject } from 'ai'

const model = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})('gpt-4.1')

export async function POST(req: Request) {
  const { messages } = await req.json()

  const [systemPrompt, ...restMessages] = messages

  const result = streamObject({
    model,
    system: systemPrompt.content,
    messages: restMessages,
    temperature: 0.3,
    schema: rpgSchema,
    onError({ error }) {
      console.error(error)
    },
  })

  return result.toTextStreamResponse()
}
