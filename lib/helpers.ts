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
