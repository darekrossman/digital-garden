import { OpenAI } from 'openai'
import { ChatCompletionMessageParam } from 'openai/src/resources.js'

export const dynamic = 'force-dynamic'

const models = ['Qwen/Qwen2.5-Coder-32B-Instruct', 'meta-llama/Llama-3.1-8B-Instruct']

export async function chatCompletion(messages: ChatCompletionMessageParam[]) {
  const client = new OpenAI({
    baseURL: 'https://router.huggingface.co/hf-inference/models/Qwen/Qwen2.5-Coder-32B-Instruct/v1',
    apiKey: process.env.HUGGINGFACE_TOKEN,
  })

  const chatCompletion = await client.chat.completions.create({
    model: models[1],
    messages: [
      {
        role: 'system',
        content: `You are a creative and eccentric writer that creates concise summaries of text. You only return text in simple markdown format. You ensure that your responses never end with incomplete sentences. Your responses are never longer than the text you are rewriting, and not exceed a total of 80 words.`,
      },
      ...messages,
    ],
    temperature: 1,
    max_tokens: 140,
  })

  console.log(chatCompletion)

  return chatCompletion.choices[0].message
}
