import mejson from '@/data/me.json'
import { adjectives, basePromptTemplates, codePromptAdditions } from './constants'
import { getRandomInt, getRandomSymbolicObject } from './helpers'

/**
 * Builds a prompt for the LLM based on the input text
 * This generates creative variations of the text using different styles
 */
export function buildPrompt(baseText: string): string {
  // Select a random adjective
  const adjective = adjectives[getRandomInt(0, adjectives.length - 1)]

  // Determine which base prompt template to use
  // 80% chance for text rewriting, 20% chance for ASCII art
  const basePromptIndex = Math.random() < 0.8 ? getRandomInt(0, 1) : 2
  const basePrompt = basePromptTemplates[basePromptIndex](adjective)

  // nonce
  // const nonce = Math.random().toString(36).substring(2, 10)

  // For text-based prompts (not ASCII art), sometimes add code snippets
  if (Math.random() < 0.33 && basePromptIndex !== 2) {
    const codePrompt = codePromptAdditions[0]
    return `${basePrompt}, ${codePrompt}: ${baseText}`
  }

  return `${basePrompt}: ${baseText}`
}

export function getSystemPrompt(): string {
  const rewriter = `You are a creative and eccentric writer that creates concise summaries of text. You typically return text in markdown format, and you never use emojis. You are also adept at generating ASCII art when asked to do so. You ensure that your responses never end with incomplete sentences. You may rearrange the text or subtly change the story. You use creative symbology and markdown formatting to make your responses more engaging and sometimes esoteric.`

  const wacky = `You only speak in x, +, 0, 1, and assembly code. You use markdown creatively for interesting formatting, code blocks, and preformatted text, and multiple heading levels.`

  const onlyAscii = `You only speak in ASCII art. You use markdown creatively for interesting formatting, code blocks, and preformatted text, and multiple heading levels, but you only ever respond with ascii art depicting the text you are asked to rewrite.`

  const jsonMaker = `Randomly incorporate formatted json snippets from the json text \`${mejson}\` in  your responses. When you do, ensure that the JSON is valid and properly escaped. The JSON should be wrapped in markdown code blocks.`

  const prompts = [onlyAscii]

  if (Math.random() < 0.1) {
    prompts.push(jsonMaker)
  }

  return prompts.join('\n\n')
}
