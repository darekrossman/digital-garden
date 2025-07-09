// Color parsing utility
export function parseColor(colorString: string): { r: number; g: number; b: number; a: number } {
  // Use a temporary canvas for robust color parsing
  const tempParseCanvas = new OffscreenCanvas(1, 1)
  const tempParseCtx = tempParseCanvas.getContext('2d')!

  tempParseCtx.fillStyle = colorString
  const computedColor = tempParseCtx.fillStyle

  if (computedColor.startsWith('#')) {
    const hex = computedColor.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return { r, g, b, a: 255 }
  }

  const match = computedColor.match(/rgba?\(([^)]+)\)/)
  if (match) {
    const values = match[1].split(',').map((v) => parseFloat(v.trim()))
    return {
      r: values[0] || 0,
      g: values[1] || 0,
      b: values[2] || 0,
      a: values[3] !== undefined ? Math.round(values[3] * 255) : 255,
    }
  }
  return { r: 0, g: 0, b: 0, a: 255 }
}

export function convertToGrayscale(
  imageData: ImageData,
  targetColor?: string,
  method: 'intensity' | 'interpolation' = 'intensity',
): ImageData {
  const { data, width, height } = imageData
  const newData = new Uint8ClampedArray(data.length)

  let targetRGB: { r: number; g: number; b: number; a: number } | null = null
  if (targetColor) {
    targetRGB = parseColor(targetColor)
  }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    // Calculate luminance using standard formula
    const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b)

    if (!targetRGB) {
      // Original grayscale behavior
      newData[i] = luminance // R
      newData[i + 1] = luminance // G
      newData[i + 2] = luminance // B
      newData[i + 3] = a // A
    } else {
      // Apply color scaling
      const intensity = luminance / 255 // Normalize to 0-1

      if (method === 'intensity') {
        // Solution 1: Color Intensity Scaling
        // Multiply target color by luminance intensity
        newData[i] = Math.round(targetRGB.r * intensity) // R
        newData[i + 1] = Math.round(targetRGB.g * intensity) // G
        newData[i + 2] = Math.round(targetRGB.b * intensity) // B
        newData[i + 3] = a // A
      } else {
        // Solution 2: Linear Interpolation
        // Interpolate between black (0,0,0) and target color
        newData[i] = Math.round(0 + (targetRGB.r - 0) * intensity) // R
        newData[i + 1] = Math.round(0 + (targetRGB.g - 0) * intensity) // G
        newData[i + 2] = Math.round(0 + (targetRGB.b - 0) * intensity) // B
        newData[i + 3] = a // A
      }
    }
  }

  return new ImageData(newData, width, height)
}

// Pixelation function
export function pixelate(imageData: ImageData, pixelSize: number): ImageData {
  const { data, width, height } = imageData
  const newData = new Uint8ClampedArray(data.length)

  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      const i = (y * width + x) * 4
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]]
      for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
        for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
          const targetI = ((y + dy) * width + (x + dx)) * 4
          newData.set([r, g, b, a], targetI)
        }
      }
    }
  }
  return new ImageData(newData, width, height)
}
