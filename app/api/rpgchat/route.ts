import { symbolicObjects } from '@/lib/constants'
import { getRandomAdjective } from '@/lib/helpers'
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

  const themes = {
    // corporate: `The theme of your stories revolve around navigating the monotony of corporate office culture with a ${getRandomAdjective()} twist.`,
    // romance: `Your stories revolve around a romantic relationship between a man and a woman, from the woman's perspective, with a ${getRandomAdjective()} twist.`,
    cyberpunk: `The theme of your stories revolve around navigating a post-apocalyptic cyberpunk world with a ${getRandomAdjective()} twist.`,
    // fantasy: `The theme of your stories revolve around navigating a fantasy world with a ${getRandomAdjective()} twist.`,
    // horror: `The theme of your stories revolve around navigating a horror world with a ${getRandomAdjective()} twist.`,
    // mystery: `The theme of your stories revolve around navigating a mystery world with a ${getRandomAdjective()} twist.`,
    // sci_fi: `The theme of your stories revolve around navigating a sci-fi world with a ${getRandomAdjective()} twist.`,
    // other: `The theme of your stories revolve around navigating a ${getRandomAdjective()} world with a ${getRandomAdjective()} twist.`,
  }

  const selectedTheme =
    themes[
      Object.keys(themes)[
        Math.floor(Math.random() * Object.keys(themes).length)
      ] as keyof typeof themes
    ]

  const system = getRPGSystemPrompt(selectedTheme)

  const model = openai('gpt-4.1')
  // const model = xai('grok-3')

  const result = streamObject({
    model,
    system,
    messages,
    temperature: 0.6,
    schema: rpgSchema,
    onError({ error }) {
      console.error(error)
    },
  })

  return result.toTextStreamResponse()
}
