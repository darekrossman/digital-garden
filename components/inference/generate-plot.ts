'use server'

import { createPlotPrompt } from '@/lib/rpg-prompts'
import { Plot, plotSchema } from '@/lib/rpg-schemas'
import { generateObject } from 'ai'

export const generatePlot = async (): Promise<Plot> => {
  // const obj = await generateObject({
  //   model: 'openai/gpt-4.1-mini',
  //   schema: plotSchema,
  //   prompt: createPlotPrompt(),
  // })

  // return obj.object

  return {
    title: 'Flicker in the Neon Abyss',
    description:
      'Set aboard the Polaris Echelon, a sprawling cyberpunk cruise ship adrift in a Polished world of shimmering neon and corporate decay, you awaken to a system malfunction that erodes your memory. As former soldier Kaelen Rourke, you must unravel cryptic clues tied to a mysterious candle symbol appearing throughout the ship—representing fragile hope amid encroaching darkness. Navigating factions vying for control and battling your own fading identity, every choice determines if you restore your past and save the ship from a catastrophic digital collapse or become lost in an endless void.',
    playerName: 'Kaelen Rourke',
    playerDescription:
      'Kaelen Rourke is a reserved ex-military operative haunted by fragmented memories and a deep-seated sense of duty. His past missions in cyber warfare left scars both mental and physical, giving him a stoic demeanor tempered by a flicker of compassion. Struggling against the gradual loss of identity, Kaelen clings to the candle motif as a symbol of guiding light in the dark, motivating him to fight for truth and redemption aboard the malfunctioning cruise ship.',
    playerImagePrompt:
      'close-up of rugged man with cybernetic eye implant and subtle scars, intense melancholic gaze, soft candlelight illuminating half his face, cinematic realism',
  }
}
