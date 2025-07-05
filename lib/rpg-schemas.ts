import { z } from 'zod'
import { symbolicObjects } from './constants'

export const rpgSchema = z.object({
  sceneDescription: z
    .string()
    .describe(
      'A brief description of the scene that will be used to create an image of the story.',
    ),
  story: z.string().describe('Markdown formatted text for the next part of the story'),
  choices: z.object({
    1: z.string().describe('The first choice.'),
    2: z.string().describe('The second choice.'),
    3: z.string().describe('The third choice.'),
  }),
  foundObject: z
    .string()
    .optional()
    .describe(
      'A collectible object that relates to the story that the player is able to keep for later use.',
    ),
})
