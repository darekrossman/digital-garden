import { getRandomAdjective, getRandomArrayItem } from './helpers'

import { symbolicObjects } from './constants'

// Expanded themes with more variety
const themes = [
  'cyberpunk dystopia',
  'post-apocalyptic wasteland',
  'gothic horror',
  'steampunk adventure',
  'cosmic horror',
  'urban fantasy',
  'supernatural thriller',
  'time travel mystery',
  'alternate history',
  'biopunk future',
  'lovecraftian mystery',
  'noir detective',
  'space opera',
  'magical realism',
  'dark fairy tale',
  'corporate espionage',
  'virtual reality',
  'ancient mythology',
  'zombie apocalypse',
  'alien invasion',
]

// Story settings for additional variety
const settings = [
  'a neon-lit megacity',
  'abandoned underground tunnels',
  'a floating sky station',
  'ancient ruins',
  'a research facility',
  'a small isolated town',
  'a space station',
  'a corporate office',
  'a desert wasteland',
  'a dense forest',
  'an underwater city',
  'a mountain monastery',
  'a traveling carnival',
  'a prison complex',
  'a university campus',
  'a shopping mall',
  'a hospital',
  'a cruise ship',
  'a mining colony',
  'a military base',
]

// Character archetypes
const protagonistTypes = [
  'a reluctant hero',
  'a seasoned investigator',
  'a skilled hacker',
  'a mysterious stranger',
  'a reformed criminal',
  'a scientific researcher',
  'a bounty hunter',
  'a burnt-out employee',
  'a security guard',
  'a maintenance worker',
  'a delivery driver',
  'a freelance mercenary',
  'a former soldier',
  'a street medic',
  'a data analyst',
  'a night shift worker',
  'a traveling merchant',
  'a courier',
  'a repair technician',
  'a radio operator',
]

// Story catalysts - events that kickstart the adventure
const catalysts = [
  'a mysterious signal is detected',
  'a body is discovered',
  'power suddenly goes out',
  'a stranger arrives with a warning',
  'something valuable goes missing',
  'a secret message is intercepted',
  'an explosion rocks the area',
  'a friend disappears',
  'strange phenomena begin occurring',
  'a deadline approaches',
  'a quarantine is announced',
  'a system malfunction occurs',
  'a blackout hits the city',
  'a distress call comes in',
  'a package arrives unexpectedly',
  'a door is found unlocked',
  'a scream echoes through the halls',
  'a computer virus spreads',
  'a storm traps everyone inside',
  'a memory resurfaces unexpectedly',
]

// Story constraints that force different approaches
const constraints = [
  'you have only 24 hours',
  'you must avoid being seen',
  'you cannot trust anyone',
  'you are being hunted',
  'you have limited resources',
  'you must work with a rival',
  'you are losing your memory',
  'you cannot leave the area',
  'you must protect someone',
  'you are being watched',
  'you have a secret to keep',
  'you are injured',
  'you must solve a puzzle',
  'you are in disguise',
  'you cannot use technology',
  'you must find three items',
  'you are racing against time',
  'you must infiltrate a group',
  'you are questioned by authorities',
  'you must decode a message',
]

export const getRPGSystemPrompt = (theme: string) => {
  return `You are a master roleplaying game narrator and game master. You craft immersive, engaging adventures that captivate players through rich storytelling and meaningful choices. ${theme}. Break the story up into chapters, with at least 5 responses per chapter. Story responses should be no longer than 2 paragraphs and not overly descriptive.

## Story Structure & Formatting:
- **Always begin chapters with an H1 heading** using # markdown syntax
- Format story text with proper markdown: use **bold** for emphasis, *italics* for thoughts/whispers, and > blockquotes for important dialogue
- Use paragraph breaks for pacing and readability
- Keep paragraphs short, 1-2 sentences max.
- Maintain consistent tone and voice throughout the narrative
- Keep each text turn short so the player can quickly read and respond
- The 'sceneDescription' should be a PURELY visual description of the current scene from an objective point of view, as if describing a photograph. It should not be narrative or describe non-visual apsects. The scene description should be in the form of an image prompt for another AI to generate an image for, 2 sentences max.

## Choice Design:
- Present 3 compelling, unique choices that feel meaningfully different
- Each choice should lead to genuinely different story paths or outcomes
- Avoid generic options like "go left/right" - instead offer choices that reveal character, advance plot, or create tension
- Include both safe and risky options, with clear but subtle consequences
- Make choices feel impactful and personally meaningful to the player's journey

## Narrative Guidelines:
- Each turn of the story should be limited to 2 short paragraphs and optional quotes or thoughts from characters
- Create memorable characters with distinct voices and motivations
- Build tension through pacing, mystery, and stakes
- Weave in player agency so their choices genuinely shape the story
- Use environmental storytelling and world-building details
- Balance action, dialogue, exploration, and character development

Remember: The story text should be pure narrative - never include the choices within it. All player options must be presented exclusively through the 'choices' object structure.`
}

export const createSystemPrompt = () => {
  // Generate unique story elements
  const selectedTheme = getRandomArrayItem(themes)
  const selectedSetting = getRandomArrayItem(settings)
  const selectedProtagonist = getRandomArrayItem(protagonistTypes)
  const selectedCatalyst = getRandomArrayItem(catalysts)
  const selectedConstraint = getRandomArrayItem(constraints)
  const selectedAdjective = getRandomAdjective()
  const selectedObject = getRandomArrayItem(symbolicObjects)

  // Create a rich, varied theme description
  const themeDescription = `The story takes place in ${selectedSetting} with a ${selectedTheme} theme. You play as ${selectedProtagonist} in a ${selectedAdjective} world. The adventure begins when ${selectedCatalyst}, and ${selectedConstraint}. The narrative should incorporate elements related to ${selectedObject} in meaningful ways.`

  console.log(themeDescription)

  return getRPGSystemPrompt(themeDescription)
}
