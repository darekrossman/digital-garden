import { z } from 'zod'

export const plotSchema = z.object({
  title: z.string().describe('The title of the plot.'),
  description: z.string().describe('A description of the plot.'),
  playerName: z.string().describe('The name of the player.'),
  playerDescription: z.string().describe('A description of the player.'),
  playerImagePrompt: z.string().describe("A concise image prompt from the player's perspective."),
  playerAge: z.number().describe('The age of the player.'),
  playerGender: z.string().describe('The gender of the player.'),
  playerRace: z.string().describe('The race of the player.'),
  playerShortDescription: z
    .string()
    .describe('A short description of the player for image prompts.'),
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
