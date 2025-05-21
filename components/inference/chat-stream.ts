'use server'

import { getSystemPrompt } from '@/lib/promptUtils'
import { togetherai } from '@ai-sdk/togetherai'
import { CoreMessage, streamText } from 'ai'
import { createStreamableValue } from 'ai/rsc'

export async function generate(messages: CoreMessage[]) {
  const stream = createStreamableValue('')
  ;(async () => {
    const { textStream } = streamText({
      model: togetherai('meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'),
      system: getSystemPrompt(),
      messages,
    })

    for await (const delta of textStream) {
      stream.update(delta)
    }

    stream.done()
  })()
}
