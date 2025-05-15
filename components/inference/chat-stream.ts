'use server'

import { getSystemPrompt } from '@/lib/promptUtils'
import { streamText } from 'ai'
import { createStreamableValue } from 'ai/rsc'
import { OpenAI } from 'openai'
import { ChatCompletionMessageParam } from 'openai/src/resources.js'

export async function generate(messages: ChatCompletionMessageParam[]) {
  const client = new OpenAI({
    baseURL: 'https://router.huggingface.co/novita/v3/openai',
    apiKey: process.env.HUGGINGFACE_TOKEN,
  })

  const stream = createStreamableValue('')

  const gen = async () => {
    const out = await client.chat.completions.create({
      model: 'meta-llama/llama-3.1-8b-instruct',
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(),
        },
        ...messages,
      ],
      temperature: 0.9,
      max_tokens: 140,
      stream: true,
    })

    for await (const chunk of out) {
      stream.update(chunk.choices[0]?.delta?.content || '')
    }

    stream.done()
  }

  gen()

  return { output: stream.value }
}
