'use server'

import { createPlotPrompt } from '@/lib/rpg-prompts'
import { Plot, plotSchema } from '@/lib/rpg-schemas'
import { generateObject } from 'ai'

export const generatePlot = async (): Promise<Plot> => {
  const obj = await generateObject({
    model: 'openai/gpt-4.1',
    schema: plotSchema,
    prompt: createPlotPrompt(),
  })

  return obj.object
}
