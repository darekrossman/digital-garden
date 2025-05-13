'use server'

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
          content: `You are a creative and eccentric writer that creates concise summaries of text. You only return text in markdown format. You ensure that your responses never end with incomplete sentences. Your responses are never longer than the text you are rewriting, and not exceed a total of 80 words. You may rearrange the text or subtly change the story. You use creative symbology and markdown formatting to make your responses more engaging and sometimes esoteric.`,
        },
        ...messages,
      ],
      temperature: 1,
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
