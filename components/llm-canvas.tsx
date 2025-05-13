import { chatCompletion } from '@/lib/inference'
import { styled } from '@/styled-system/jsx'
import { ChatCompletionMessageParam } from 'openai/src/resources.js'

export const dynamic = 'force-dynamic'

export async function LLMCanvas({ messages }: { messages?: ChatCompletionMessageParam[] }) {
  if (!messages) return 'No input'

  const text = await chatCompletion(messages)

  return <styled.p>{text.content}</styled.p>
}
