/**
 * Constants for the portfolio application
 */

/**
 * List of adjectives used for generating creative text prompts
 */
export const adjectives = [
  'Curious',
  'Agile',
  'Resilient',
  'Luminous',
  'Elusive',
  'Quiet',
  'Bold',
  'Fragile',
  'Stark',
  'Witty',
  'Obscure',
  'Radiant',
  'Hollow',
  'Feral',
  'Subtle',
  'Pristine',
  'Jagged',
  'Ironic',
  'Fleeting',
  'Brutal',
  'Serene',
  'Cunning',
  'Timid',
  'Decisive',
  'Abstract',
  'Savage',
  'Soft',
  'Vibrant',
  'Murky',
  'Restless',
]

/**
 * Default intro text for the portfolio
 */
export const defaultIntro = {
  heading: "I'm Darek.",
  paragraphs: [
    "I live in St. Pete, FL where I've been working on physical and digital creations for the last two decades",
    'I adapt to complexity and I strive for simplicity. I design for clarity and I build for scale. I lead with curiosity and I ask deeper questions',
  ],
}

/**
 * Base prompts for generating text variations
 */
export const basePromptTemplates = [
  (adjective: string) => `Rewrite the following text in a ${adjective} way.`,
  (adjective: string) =>
    `Rewrite the following text in a ${adjective} way, and scramble the name of the person mentioned in strange ways, replacing some letters entirely`,
  (adjective: string) => `Generate ${adjective} ASCII art.`,
]

/**
 * Code prompts to occasionally add to text generation
 */
export const codePromptAdditions = [
  'adding full or partial code snippets if the text is sufficiently strange, using assembly language, javascript, python, cobalt or json',
]
