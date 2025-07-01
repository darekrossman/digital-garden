'use server'

import { getSystemPrompt } from '@/lib/promptUtils'
import { openai } from '@ai-sdk/openai'
import { CoreMessage, streamText } from 'ai'
import { createStreamableValue } from 'ai/rsc'

export async function generate(messages: CoreMessage[]) {
  const stream = createStreamableValue('')

  const run = async () => {
    const { textStream } = streamText({
      model: openai('gpt-4o-mini'),
      system: getSystemPrompt(),
      messages,
      maxTokens: 2000,
    })

    for await (const delta of textStream) {
      stream.update(delta)
    }

    stream.done()
  }

  run()
}
