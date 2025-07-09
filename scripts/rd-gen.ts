import { inventoryObjects } from '@/lib/constants'
import { slugify } from '@/lib/helpers'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local', quiet: true })

const token = process.env.RD_API_KEY || ''

const generateItemImage = async (prompt: string) => {
  console.log(`Generating image for ${prompt}`)

  const style = 'rd_fast__mc_item'

  const response = await fetch('https://api.retrodiffusion.ai/v1/inferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RD-Token': token,
    },
    body: JSON.stringify({
      width: 128,
      height: 128,
      num_images: 1,
      prompt,
      prompt_style: style,
    }),
  })

  const data = await response.json()
  const image = data.base64_images[0]

  // Create the output directory if it doesn't exist
  const outputDir = path.join(process.cwd(), 'public', 'images', 'assets')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Create filename from slugified prompt
  const filename = `${slugify(prompt)}.png`
  const filepath = path.join(outputDir, filename)

  // Convert base64 to buffer and write to file
  const imageBuffer = Buffer.from(image, 'base64')
  fs.writeFileSync(filepath, imageBuffer)

  console.log(`Image saved to: ${filepath}`)
}

const main = async () => {
  const batchSize = 5

  // Process inventoryObjects in batches of 5
  for (let i = 0; i < inventoryObjects.length; i += batchSize) {
    const batch = inventoryObjects.slice(i, i + batchSize)
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(inventoryObjects.length / batchSize)}`,
    )
    await Promise.all(batch.map(generateItemImage))
  }
}

main()
