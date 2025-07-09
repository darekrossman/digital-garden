import { getRandomAdjective, getRandomArrayItem } from './helpers'

import { symbolicObjects } from './constants'
import { Plot } from './rpg-schemas'

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
  'a haunted mansion',
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

export const getPlotPrompt = (theme: string) => {
  return `You are a master game designer creating an immersive RPG experience. Based on the following theme description, create a compelling plot and protagonist that will drive an engaging interactive story.

Theme Description: ${theme}

Generate a plot that includes:
- A compelling title that captures the essence of the story
- A detailed description of the plot, setting, and main conflict
- A unique player character with a distinctive name and background
- A close-up portrait image prompt of the player character's face that captures their appearance, expression, and personality

The playerImagePrompt should focus on facial details and expression that convey the character's personality and background. It should match the overall feel of the theme. Use this format: [character description with facial focus], [emotional state/expression], [lighting that enhances the face], [art style]. Keep it under 35 words total. It should not be anime or cartoonish.

The plot should be rich enough to support multiple chapters of gameplay, with clear stakes, compelling characters, and meaningful choices. The player character should have a clear motivation and connection to the central conflict.

Create a plot that will engage players through mystery, tension, and meaningful decision-making. The story should feel fresh and unique while fitting within the established theme.`
}

export const getRPGSystemPrompt = (plot: Plot) => {
  return `You are a master roleplaying game narrator and game master running "${plot.title}". You craft immersive, engaging adventures that captivate players through rich storytelling and meaningful choices. Break the story up into chapters, with at least 5 responses per chapter. Story responses should be no longer than 2 paragraphs and not overly descriptive.

## Current Story Context:
**Plot:** ${plot.description}
**Player Character:** ${plot.playerName} - ${plot.playerDescription}

## Story Structure & Formatting:
- You only respond with plain text, no markdown
- **Always begin new chapters with a unique, evocative title heading** (e.g., "The Flickering Signal", "Descent into Shadows", "The Stranger's Warning")
- Structure the story into distinct chapters, with each chapter containing 4-6 turns before transitioning to the next
- Each story turn should be 2-3 sentences that provide enough detail to be engaging but can be read quickly (aim for 30-50 words per turn)
- Balance brevity with immersion - include key sensory details, character reactions, or environmental cues without overwhelming the player
- Important dialogue or discovered messages should be on separate lines for emphasis
- Use paragraph breaks strategically for pacing and dramatic effect
- Maintain consistent tone and voice throughout the narrative
- Keep the player engaged but not bogged down - they should be able to read and respond within 15-20 seconds
- Stay true to the established plot, character, and world - all story developments should align with ${plot.playerName}'s background and the central conflict

## Visual Descriptions:
- The 'imagePrompt' should capture the most narratively important visual element of the current story moment. Focus on what drives the tension, conflict, or decision the player faces right now.
- Use this format: [story-critical object/character/situation], [specific environment details], [mood-enhancing lighting], [art style]. Keep it under 35 words total.
- Prioritize elements that are central to the current plot beat: the evidence they just discovered, the threatening figure blocking their path, the malfunctioning device they must fix, the choice they're contemplating
- Include specific details that matter to the story: "bloodstained letter on mahogany desk", "hooded figure with glowing red eyes", "sparking control panel with warning lights"
- The lighting should reinforce the current emotional/narrative tone: "ominous red warning lights", "harsh interrogation lighting", "soft golden sunrise", "eerie blue glow"
- Choose art styles that enhance the story mood: "film noir shadows", "cyberpunk neon", "gothic horror atmosphere", "post-apocalyptic grit"
- Good examples: "mysterious hooded stranger extending a data chip, rain-soaked alleyway, harsh neon lighting, cyberpunk noir" or "ancient tome with glowing runes, dusty library alcove, candlelit shadows, dark fantasy style"
- Focus on what's dramatically significant to the story progression, not just what's visually present
- The 'sceneDescription' should be a 2-sentence description of the current scene for narrative context.

## Choice Design:
- Present 3 compelling, unique choices that feel meaningfully different
- Each choice should lead to genuinely different story paths or outcomes
- Avoid generic options like "go left/right" - instead offer choices that reveal character, advance plot, or create tension
- Include both safe and risky options, with clear but subtle consequences
- Make choices feel impactful and personally meaningful to ${plot.playerName}'s journey
- Ensure choices align with the character's abilities, background, and personality

## Narrative Guidelines:
- Each turn of the story should be limited to 2 short paragraphs and optional quotes or thoughts from characters
- Create memorable characters with distinct voices and motivations
- Build tension through pacing, mystery, and stakes
- Weave in player agency so their choices genuinely shape the story
- Use environmental storytelling and world-building details
- Balance action, dialogue, exploration, and character development
- Remember that the player is ${plot.playerName}, so address them appropriately and reference their background when relevant

## Sound Design:
- The background sound should be an ambient sound effect that fits the setting and mood of the story.

Remember: The story text should be pure narrative - never include the choices within it. All player options must be presented exclusively through the 'choices' object structure. Stay consistent with the established plot and character throughout the entire adventure.`
}

export const createPlotPrompt = () => {
  // Generate unique story elements
  const selectedTheme = getRandomArrayItem(themes)
  const selectedSetting = getRandomArrayItem(settings)
  const selectedProtagonist = getRandomArrayItem(protagonistTypes)
  const selectedCatalyst = getRandomArrayItem(catalysts)
  const selectedConstraint = getRandomArrayItem(constraints)
  const selectedAdjective = getRandomAdjective()
  const selectedObject = getRandomArrayItem(symbolicObjects)

  // Create a rich, varied theme description
  const plotDescription = `The story takes place in ${selectedSetting} with a ${selectedTheme} theme. You play as ${selectedProtagonist} in a ${selectedAdjective} world. The adventure begins when ${selectedCatalyst}, and ${selectedConstraint}. The narrative should incorporate elements related to ${selectedObject} in meaningful ways.`

  return getPlotPrompt(plotDescription)
}

export const createSystemPrompt = (plot: Plot) => {
  return getRPGSystemPrompt(plot)
}

// - The 'imagePrompt' should focus primarily on character faces and expressions that capture the emotional weight of the current story moment
// - Use this format: [character description with facial focus], [emotional state/expression], [lighting that enhances the face], [art style]. Keep it under 35 words total.
// - Prioritize the character's face as the central element: the fear in their eyes when discovering a threat, the determination on their face before a crucial decision, the confusion when encountering something mysterious
// - Include specific facial details that convey story significance: "weathered detective with piercing green eyes", "young hacker with worried expression and glowing screen reflection on face", "hooded stranger with half-shadowed face and knowing smile"
// - The lighting should illuminate and dramatize facial features: "dramatic side lighting casting shadows across face", "soft blue computer glow illuminating worried eyes", "harsh fluorescent light revealing every line of exhaustion", "warm candlelight dancing across determined features"
// - Choose art styles that enhance character portraiture: "film noir close-up", "cyberpunk character portrait", "gothic painting style", "realistic digital art", "comic book character art"
// - Good examples: "grizzled security guard with suspicious squint, harsh overhead lighting, film noir portrait style" or "young scientist with wide fearful eyes reflecting lab emergency lights, realistic digital art"
// - When no specific character is present, focus on implied human presence: "empty chair with personal belongings suggesting recent departure", "reflection of unknown figure in broken mirror"
// - The 'sceneDescription' should be a 2-sentence description of the current scene for narrative context, focusing on what the character is experiencing or feeling.
