/**
 * Helper functions for the portfolio application
 */

// Helper function that returns a random integer between min and max (inclusive)
// with optional non-linear distribution
export const getRandomInt = (
  min: number,
  max: number,
  options?: {
    // Distribution type to use for weighting
    distribution?: 'uniform' | 'exponential' | 'gaussian' | 'power'
    // Factor that controls the degree of weighting (higher = more extreme curve)
    factor?: number
  },
): number => {
  min = Math.ceil(min)
  max = Math.floor(max)

  // Default to uniform distribution
  const distribution = options?.distribution || 'uniform'
  // Default factor value
  const factor = options?.factor ?? 2

  // Uniform distribution (original behavior)
  if (distribution === 'uniform') {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // Generate a random value between 0 and 1
  const random = Math.random()

  // Range size
  const range = max - min + 1

  switch (distribution) {
    // Weight towards lower values
    case 'exponential': {
      // Exponential distribution: -log(1-r)/factor
      const weighted = -Math.log(1 - random) / factor
      // Scale to our range and clamp between 0 and 1
      const normalized = Math.min(weighted, 1)
      return Math.floor(normalized * range) + min
    }

    // Bell curve around the middle
    case 'gaussian': {
      // Simple approximation of normal distribution using average of multiple random values
      let sum = 0
      const samples = Math.max(1, Math.round(factor))
      for (let i = 0; i < samples; i++) {
        sum += Math.random()
      }
      const normalized = sum / samples
      return Math.floor(normalized * range) + min
    }

    // Power distribution - can weight toward either end based on factor
    case 'power': {
      // If factor is positive, weights toward min
      // If factor is negative, weights toward max
      const power = Math.abs(factor)
      const weighted = factor >= 0 ? Math.pow(random, power) : 1 - Math.pow(1 - random, power)
      return Math.floor(weighted * range) + min
    }

    default:
      return Math.floor(random * range) + min
  }
}

/**
 * Debounce function to limit the rate at which a function can fire
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Creates an array of specified length filled with the output of a callback
 */
export function createArrayOfLength<T>(length: number, callback: (index: number) => T): T[] {
  return Array.from({ length }, (_, index) => callback(index))
}

/**
 * Safely parse JSON with a fallback value
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch (error) {
    return fallback
  }
}

/**
 * Get a random item from an array
 */
export function getRandomArrayItem<T>(array: T[]): T {
  return array[getRandomInt(0, array.length - 1)]
}

/**
 * Create an interval that can be easily cleared
 */
export function createClearableInterval(
  callback: () => void,
  ms: number,
): {
  clear: () => void
  id: NodeJS.Timeout
} {
  const id = setInterval(callback, ms)
  return {
    clear: () => clearInterval(id),
    id,
  }
}

/**
 * Clear all timeouts in an array
 */
export function clearAllTimeouts(timeouts: (NodeJS.Timeout | number)[]): void {
  timeouts.forEach((id) => clearTimeout(id))
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Returns a random font family key based on weighting (e.g., { pixel: 0.1, majorMono: 0.1, mono: 0.8 })
 */
export function getRandomFontFamily(weighting: Record<string, number>): string {
  const keys = Object.keys(weighting)
  const weights = keys.map((k) => weighting[k])
  const total = weights.reduce((sum, w) => sum + w, 0)
  const r = Math.random() * total
  let acc = 0
  for (let i = 0; i < keys.length; i++) {
    acc += weights[i]
    if (r < acc) return keys[i]
  }
  // fallback (should not happen)
  return keys[0]
}
