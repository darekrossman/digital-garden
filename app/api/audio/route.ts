import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  const { text, voice = 'fable' } = await req.json()

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: voice,
        input: text,
        instructions: 'Speak in a deep, serious, but emotive tone, like a storyteller.',
        speed: 1.1,
        stream_format: 'sse',
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    // Create a ReadableStream to process SSE events
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()

                // Check for end of stream marker
                if (data === '[DONE]') {
                  controller.close()
                  return
                }

                // Skip empty data lines
                if (!data) continue

                try {
                  const parsed = JSON.parse(data)
                  if (parsed.audio) {
                    // Convert base64 audio chunk to Uint8Array
                    const audioChunk = Uint8Array.from(atob(parsed.audio), (c) => c.charCodeAt(0))
                    controller.enqueue(audioChunk)
                  }
                } catch (e) {
                  // Only log unexpected parsing errors
                  console.error('Error parsing SSE data:', e, 'Data:', data)
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error)
          controller.error(error)
        } finally {
          reader.releaseLock()
        }
      },
    })

    // Return streaming response with appropriate headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Audio generation error:', error)
    return new Response('Error generating audio', { status: 500 })
  }
}
