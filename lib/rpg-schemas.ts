import { z } from 'zod'

export const plotSchema = z.object({
  title: z.string().describe('The title of the plot.'),
  description: z.string().describe('A description of the plot.'),
  playerName: z.string().describe('The name of the player.'),
  playerDescription: z.string().describe('A description of the player.'),
  playerImagePrompt: z.string().describe("A concise image prompt from the player's perspective."),
})

export type Plot = z.infer<typeof plotSchema>

export const rpgSchema = z.object({
  imagePrompt: z.string().describe("A concise image prompt from the player's perspective."),
  story: z.string().describe('Text for the next part of the story'),
  sceneDescription: z.string().describe('A 2-sentence description of the scene.'),
  choices: z.object({
    1: z.string().describe('The first choice.'),
    2: z.string().describe('The second choice.'),
    3: z.string().describe('The third choice.'),
  }),
  backgroundSound: z
    .string()
    .describe('A sound effect to play in the background that matches with the setting.'),
})
