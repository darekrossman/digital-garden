import { z } from 'zod'
import { symbolicObjects } from './constants'

export const rpgSchema = z.object({
  sceneDescription: z.string().describe("A concise image prompt from the player's perspective."),
  story: z.string().describe('Markdown formatted text for the next part of the story'),
  choices: z.object({
    1: z.string().describe('The first choice.'),
    2: z.string().describe('The second choice.'),
    3: z.string().describe('The third choice.'),
  }),
})
