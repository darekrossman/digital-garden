import { symbolicObjects } from '@/lib/constants'
import { getRandomAdjective, getRandomArrayItem } from '@/lib/helpers'
import { getRPGSystemPrompt } from '@/lib/rpg-prompts'
import { rpgSchema } from '@/lib/rpg-schemas'
import { createOpenAI } from '@ai-sdk/openai'
import { createXai } from '@ai-sdk/xai'
import { streamObject } from 'ai'

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// const xai = createXai({
//   apiKey: process.env.XAI_API_KEY,
// })

export async function POST(req: Request) {
  const { messages } = await req.json()

  const [systemPrompt, ...restMessages] = messages

  console.log(systemPrompt)

  const model = openai('gpt-4.1')
  // const model = xai('grok-3')

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
