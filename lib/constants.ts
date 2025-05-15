/**
 * Predefined colors for wireframe objects
 */
export const wireframeColors = [
  0xff0000, // Red
  0x00ff00, // Green
  0x0000ff, // Blue
  0xffff00, // Yellow
  0xff00ff, // Magenta
  0x00ffff, // Cyan
  0xff8000, // Orange
  0x8000ff, // Purple
  0x0080ff, // Light Blue
  0x8fff00, // Lime
  0xff0080, // Hot Pink
  0x000000, // Black
  0xffffff, // White
]

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

export const symbolicObjects = [
  'brain',
  'skull',
  'anchor',
  'space shuttle',
  'circuit board',
  'compass',
  'lightning bolt',
  'telescope',
  'metronome',
  'gear',
  'keyboard',
  'obsidian shard',
  'lighthouse',
  'puzzle piece',
  'magnet',
  'lab flask',
  'hourglass',
  'phoenix',
  'satellite',
  'wireframe cube',
  'mechanical eye',
  'switchblade',
  'echo wave',
  'spindle',
  'flux capacitor',
  'astronaut helmet',
  'candle',
  'origami crane',
  'data stream',
  'spiral galaxy',
  'ouroboros',
  'signal tower',
  'antenna',
  'seedling',
  'fractal',
  'neural net',
  'glass prism',
  'welding mask',
  'sound wave',
  'swiss army knife',
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
