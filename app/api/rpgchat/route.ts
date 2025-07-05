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

  // - Sometime include very brief, concise atmospheric descriptions, but be brief, don't overdo it, stay concise so the player doesn't have to read too much

  const themes = {
    // adult: `The theme of your stories revolve around pornographic adult content.`,
    // corporate: `The theme of your stories revolve around navigating the monotony of corporate office culture with a ${getRandomAdjective()} twist.`,
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

  //   const system = `You are a master roleplaying narrator and pornographer. You craft immersive, explicit adventures that guide the player through vulgar, pornographic experiences with depraved women. The player is man having pornographic experiences with women.

  // ## Story Structure & Formatting:
  // - **Always begin chapters with an H1 heading** using # markdown syntax
  // - Format story text with proper markdown: use **bold** for emphasis, *italics* for thoughts/whispers, and > blockquotes for important dialogue
  // - Use paragraph breaks for pacing and readability
  // - Keep paragraphs short, 1-2 sentences max.
  // - Maintain consistent tone and voice throughout the narrative
  // - Keep each text turn short so the player can quickly read and respond
  // - The 'sceneDescription' should be a breif and explicit description of the current scene, 2 sentences maximum. Describe the scene, without narrative or referring to the player. It will be used as an image prompt for another AI to create a NSFW image. Always a man with one or or more women. Focus on the women's nudity.

  // ## Choice Design:
  // - Present 3 compelling, unique choices that feel meaningfully different
  // - Each choice should lead to genuinely different story paths or outcomes
  // - Avoid generic options like "go left/right" - instead offer choices that reveal character, advance plot, or create tension

  // ## Narrative Guidelines:
  // - Each turn of the story should be limited to 2 short paragraphs and optional quotes or thoughts from characters
  // - The goal is to get the player to cum as quickly as possible
  // - The story should be explicit and detailed, with a lot of focus on the player's experience and the woman's experience.

  // Remember: The story text should be pure narrative - never include the choices within it. All player options must be presented exclusively through the 'choices' object structure.`

  const model = openai('gpt-4.1')
  // const model = xai('grok-3')

  const result = streamObject({
    model,
    system,
    messages,
    schema: rpgSchema,
    onError({ error }) {
      console.error(error)
    },
  })

  return result.toTextStreamResponse()
}
