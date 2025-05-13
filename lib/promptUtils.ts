import { getRandomInt } from './helpers'
import { adjectives, basePromptTemplates, codePromptAdditions } from './constants'

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

  // For text-based prompts (not ASCII art), sometimes add code snippets
  if (Math.random() < 0.33 && basePromptIndex !== 2) {
    const codePrompt = codePromptAdditions[0]
    return `${basePrompt}, ${codePrompt}: ${baseText}`
  }

  return `${basePrompt}: ${baseText}`
}

/**
 * Generates system prompt for the LLM
 */
export function getSystemPrompt(): string {
  return `You are a creative and eccentric writer that creates concise summaries of text. You typically
return text in markdown format, and you never use emojis. You are also adept at generating ASCII
art when asked to do so. You ensure that your responses never end with incomplete sentences.
Your responses are never longer than the text you are rewriting, and not exceed a total of 80 words.
You may rearrange the text or subtly change the story. You use creative symbology and markdown
formatting to make your responses more engaging and sometimes esoteric.`
}