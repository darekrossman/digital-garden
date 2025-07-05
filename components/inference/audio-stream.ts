import OpenAI from 'openai'

export interface AudioStreamOptions {
  text: string
  voice?: string
  speed?: number
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: Error) => void
}

export class AudioStreamer {
  private currentAudio: HTMLAudioElement | null = null
  private mediaSource: MediaSource | null = null

  async play(options: AudioStreamOptions) {
    const { text, voice = 'fable', speed = 1.1, onStart, onEnd, onError } = options

    try {
      // Stop any currently playing audio
      this.stop()

      const response = await fetch('/api/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice,
          speed,
        }),
      })

      if (!response.ok) throw new Error('Audio generation failed')

      onStart?.()

      if (response.body) {
        await this.streamAudio(response.body, onEnd, onError)
      }
    } catch (error) {
      onError?.(error as Error)
    }
  }

  private async streamAudio(
    body: ReadableStream<Uint8Array>,
    onEnd?: () => void,
    onError?: (error: Error) => void,
  ) {
    const reader = body.getReader()

    try {
      // Try MediaSource API first for progressive playback
      if ('MediaSource' in window && MediaSource.isTypeSupported('audio/mpeg')) {
        await this.streamWithMediaSource(reader, onEnd, onError)
      } else {
        // Fallback to buffered playback
        await this.streamWithBuffer(reader, onEnd, onError)
      }
    } catch (error) {
      onError?.(error as Error)
    }
  }

  private async streamWithMediaSource(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onEnd?: () => void,
    onError?: (error: Error) => void,
  ) {
    return new Promise<void>((resolve, reject) => {
      this.mediaSource = new MediaSource()
      this.currentAudio = new Audio()
      this.currentAudio.src = URL.createObjectURL(this.mediaSource)

      let sourceBuffer: SourceBuffer | null = null
      let isPlaying = false
      const pendingChunks: Uint8Array[] = []

      const appendNextChunk = () => {
        if (sourceBuffer && !sourceBuffer.updating && pendingChunks.length > 0) {
          const chunk = pendingChunks.shift()!
          sourceBuffer.appendBuffer(chunk)
        }
      }

      this.mediaSource.addEventListener('sourceopen', () => {
        sourceBuffer = this.mediaSource!.addSourceBuffer('audio/mpeg')

        sourceBuffer.addEventListener('updateend', () => {
          if (!isPlaying && this.currentAudio!.readyState >= 2) {
            this.currentAudio!.play()
            isPlaying = true
          }
          appendNextChunk()
        })

        sourceBuffer.addEventListener('error', (e) => {
          onError?.(new Error('SourceBuffer error'))
          reject(e)
        })

        // Start reading stream
        this.processStream(reader, sourceBuffer, pendingChunks, appendNextChunk)
          .then(() => {
            if (this.mediaSource!.readyState === 'open') {
              this.mediaSource!.endOfStream()
            }
            resolve()
          })
          .catch(reject)
      })

      this.currentAudio.addEventListener('ended', () => {
        this.cleanup()
        onEnd?.()
        resolve()
      })

      this.currentAudio.addEventListener('error', (e) => {
        onError?.(new Error('Audio playback error'))
        reject(e)
      })
    })
  }

  private async streamWithBuffer(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onEnd?: () => void,
    onError?: (error: Error) => void,
  ) {
    const chunks: Uint8Array[] = []

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      // Combine all chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const combined = new Uint8Array(totalLength)
      let offset = 0

      for (const chunk of chunks) {
        combined.set(chunk, offset)
        offset += chunk.length
      }

      const blob = new Blob([combined], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(blob)

      this.currentAudio = new Audio(audioUrl)

      this.currentAudio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl)
        onEnd?.()
      })

      this.currentAudio.addEventListener('error', (e) => {
        URL.revokeObjectURL(audioUrl)
        onError?.(new Error('Audio playback error'))
      })

      await this.currentAudio.play()
    } catch (error) {
      onError?.(error as Error)
    }
  }

  private async processStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    sourceBuffer: SourceBuffer,
    pendingChunks: Uint8Array[],
    appendNextChunk: () => void,
  ) {
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        pendingChunks.push(value)

        if (!sourceBuffer.updating) {
          appendNextChunk()
        }
      }
    } catch (error) {
      throw error
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
    }
    this.cleanup()
  }

  private cleanup() {
    if (this.currentAudio?.src) {
      URL.revokeObjectURL(this.currentAudio.src)
    }
    this.currentAudio = null
    this.mediaSource = null
  }
}

// Simple function-based API for one-off usage
export async function playAudioStream(options: AudioStreamOptions) {
  const streamer = new AudioStreamer()
  return streamer.play(options)
}
