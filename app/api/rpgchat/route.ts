import { rpgSchema } from '@/lib/rpg-schemas'
import { streamObject } from 'ai'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const [systemPrompt, ...restMessages] = messages

  const result = streamObject({
    model: 'openai/gpt-4.1',
    system: systemPrompt.content,
    messages: restMessages,
    temperature: 0.6,
    schema: rpgSchema,
    maxOutputTokens: 128000,
    // presencePenalty: 1.5,
    // frequencyPenalty: 1.5,
    onFinish(result) {
      // console.log(result)
    },
    onError({ error }) {
      console.error(error)
    },
  })

  return result.toTextStreamResponse()
}
