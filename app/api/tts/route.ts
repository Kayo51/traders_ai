import { NextRequest } from 'next/server'
import { getAudio } from '@/lib/audio-cache'
import { generateAudio } from '@/lib/tts'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return new Response('Missing id', { status: 400 })

  const cached = getAudio(id)
  if (!cached) return new Response('Audio not found', { status: 404 })

  return new Response(cached, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': cached.byteLength.toString(),
      'Cache-Control': 'public, max-age=300',
    },
  })
}

// Fallback: generate on demand for error/static phrases
export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text) return new Response('Missing text', { status: 400 })

  try {
    const buffer = await generateAudio(text)
    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.byteLength.toString(),
      },
    })
  } catch (err) {
    console.error('[tts]', err)
    return new Response('TTS generation failed', { status: 502 })
  }
}
