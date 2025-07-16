import { streamText } from 'ai'

export async function POST(req: Request) {
  const {
    prompt,
    maxTokens,
    systemPrompt,
  }: {
    prompt: string
    maxTokens?: number
    systemPrompt?: string
  } = await req.json()

  const result = streamText({
    model: 'openai/gpt-4.1',
    system: systemPrompt,
    prompt,
    maxOutputTokens: maxTokens ?? 600,
    temperature: 0.3,
    presencePenalty: 1,
    frequencyPenalty: 1,
    // experimental_transform: smoothStream({
    //   delayInMs: 200,
    // chunking: 'line',
    // }),
    onError({ error }) {
      console.error(error)
    },
  })

  return result.toTextStreamResponse()
}
