import { rpgSchema } from '@/lib/rpg-schemas'
import { streamObject } from 'ai'

// const model = createOpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// })('gpt-4.1')

export async function POST(req: Request) {
  const { messages } = await req.json()

  const [systemPrompt, ...restMessages] = messages

  const result = streamObject({
    model: 'openai/gpt-4.1',
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
