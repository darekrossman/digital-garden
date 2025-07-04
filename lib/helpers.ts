/**
 * Helper functions for the portfolio application
 */

import { adjectives, symbolicObjects } from './constants'

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

/**
 * Get a random adjective from the adjectives array
 */
export function getRandomAdjective(): string {
  return adjectives[getRandomInt(0, adjectives.length - 1)]
}

/**
 * Get a random object from the symbolicObjects array
 */
export function getRandomSymbolicObject(): string {
  return symbolicObjects[getRandomInt(0, symbolicObjects.length - 1)]
}

/**
 * Converts a hex color to SVG feColorMatrix values
 * @param hex - Hex color string (e.g., "#FF0000", "#ff0000", "FF0000")
 * @param alphaMatrix - Optional alpha transformation row (default: "0 0 0 1 0" for full opacity)
 * @returns Color matrix values string for SVG feColorMatrix
 */
export function hexToColorMatrix(hex: string, alphaMatrix: string = '0 0 0 1 0'): string {
  // Remove # if present and ensure uppercase
  const cleanHex = hex.replace('#', '').toUpperCase()

  // Parse hex to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)

  // Normalize to 0-1 range
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  // Create color matrix
  // Format: R G B A Offset
  const matrix = [
    `0 0 0 0 ${rNorm}`, // Red channel
    `0 0 0 0 ${gNorm}`, // Green channel
    `0 0 0 0 ${bNorm}`, // Blue channel
    alphaMatrix, // Alpha channel
  ]

  return matrix.join('\n')
}

/**
 * Converts RGB values to SVG feColorMatrix values
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @param alphaMatrix - Optional alpha transformation row (default: "0 0 0 1 0" for full opacity)
 * @returns Color matrix values string for SVG feColorMatrix
 */
export function rgbToColorMatrix(
  r: number,
  g: number,
  b: number,
  alphaMatrix: string = '0 0 0 1 0',
): string {
  // Normalize to 0-1 range
  const rNorm = Math.max(0, Math.min(255, r)) / 255
  const gNorm = Math.max(0, Math.min(255, g)) / 255
  const bNorm = Math.max(0, Math.min(255, b)) / 255

  // Create color matrix
  const matrix = [
    `0 0 0 0 ${rNorm}`, // Red channel
    `0 0 0 0 ${gNorm}`, // Green channel
    `0 0 0 0 ${bNorm}`, // Blue channel
    alphaMatrix, // Alpha channel
  ]

  return matrix.join('\n')
}
