'use server'

import { createPlotPrompt } from '@/lib/rpg-prompts'
import { Plot, plotSchema } from '@/lib/rpg-schemas'
import { generateObject } from 'ai'

export const generatePlot = async (): Promise<Plot> => {
  // const obj = await generateObject({
  //   model: 'openai/gpt-4.1',
  //   schema: plotSchema,
  //   prompt: createPlotPrompt(),
  // })

  // return obj.object

  return {
    title: 'Echoes in the Reactor House',
    description:
      "Set in a desolate wasteland, the last remnants of humanity have built a cybernetic enclave around an ancient, sprawling mansion infamously known as the Reactor House. Once a luxury estate, it was repurposed centuries ago to house a prototype flux capacitor—humanity’s last hope for repairing the shattered fabric of time and restoring the world. You play as Lena Voss, a weary maintenance worker tasked with keeping the mansion's failing tech alive. But after intercepting a scrambled emergency message, Lena is ambushed by a ghostly presence in the halls and injured. As she recovers, she discovers that the mansion’s haunted echoes hide coded messages about the true nature of the flux capacitor, which is activating poltergeist-like phenomena and pulling the past’s horrors into the present. With resources dwindling and the capacitor's flux threatening to unravel what’s left of reality, Lena must explore haunted corridors, repair sabotaged systems, decipher clues left by long-gone engineers, and decide who to trust in a world where the line between machine, ghost, and survivor is blurring. The mansion itself is both ally and enemy, shifting and revealing secrets with each flux pulse. Every choice matters—will Lena stabilize the capacitor to save what remains, or let the mansion's haunted power rewrite fate entirely?",
    playerName: 'Lena Voss',
    playerDescription:
      'Lena Voss is a skilled, resilient maintenance worker in the cybernetic wasteland, trained in jury-rigging machinery and deciphering old tech. Haunted by a past loss, she is practical, cautious but courageous. Lena is often seen with her uniform stained by oil and her heartrending focus on survival, though a flicker of curiosity and rebellious hope burns in her eyes.',
    playerImagePrompt:
      'White woman, short brown hair, oil-marked face, piercing green eyes, cautious hopeful expression, stark directional lighting highlighting features, painterly realism.',
    playerAge: 34,
    playerGender: 'Female',
    playerRace: 'White',
    playerShortDescription: 'White woman, short brown hair, grease-stained blue jumpsuit',
  }
}
