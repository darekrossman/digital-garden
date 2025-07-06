import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { NextRequest } from 'next/server'

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
})

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  const createAudioStreamFromText = async (text: string) => {
    const audioStream = await elevenlabs.textToSpeech.stream('NOpBlnGInO9m6vDvFkFC', {
      modelId: 'eleven_flash_v2_5',
      text,
      outputFormat: 'mp3_44100_128',
      voiceSettings: {
        similarityBoost: 0.6,
        stability: 0.4,
        speed: 1.1,
      },
    })

    return audioStream
  }

  const audioStream = await createAudioStreamFromText(text)

  return new Response(audioStream, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  })
}
