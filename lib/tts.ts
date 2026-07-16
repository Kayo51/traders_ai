import crypto from 'crypto'
import db from '@/lib/db'

const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'Xb7hH8MSUJpSbSDYk0k2'

export type VoiceConfig = {
  receptionistVoice?: string | null
  receptionistGender?: string | null
  receptionistAccent?: string | null
}

export function resolveVoiceId(config?: VoiceConfig | null): string {
  if (!config) return DEFAULT_VOICE_ID

  if (config.receptionistVoice) {
    const named = process.env[`ELEVENLABS_VOICE_${config.receptionistVoice.toUpperCase()}`]
    if (named) return named
  }

  if (config.receptionistGender && config.receptionistAccent) {
    const combo = process.env[`ELEVENLABS_VOICE_${config.receptionistGender.toUpperCase()}_${config.receptionistAccent.toUpperCase()}`]
    if (combo) return combo
  }

  return DEFAULT_VOICE_ID
}

export function stripNonSpeech(str: string): string {
  return str
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FEFF}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export async function generateAudio(text: string, voiceId?: string): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not set')

  const id = voiceId ?? DEFAULT_VOICE_ID

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${id}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: stripNonSpeech(text),
        model_id: 'eleven_flash_v2_5',
        output_format: 'mp3_22050_32',
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    }
  )

  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`)
  return res.arrayBuffer()
}

// Checks the DB cache before calling ElevenLabs. Identical text+voice is only
// generated once — subsequent calls return the stored bytes immediately.
// Cache is best-effort: any DB error falls back to a direct ElevenLabs call
// so a cache failure never kills a live call.
export async function generateAudioCached(text: string, voiceId: string): Promise<ArrayBuffer> {
  const clean = stripNonSpeech(text)
  const hash = crypto.createHash('sha256').update(`${clean}|${voiceId}`).digest('hex').slice(0, 32)

  try {
    const cached = await db.ttsCache.findUnique({ where: { hash } })
    if (cached) {
      db.ttsCache.update({ where: { hash }, data: { hitCount: { increment: 1 } } }).catch(() => {})
      const buf = cached.audio as Buffer
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
    }
  } catch (err) {
    console.warn('[tts-cache] cache read failed, falling back to ElevenLabs:', err)
  }

  const audio = await generateAudio(text, voiceId)
  db.ttsCache.create({ data: { hash, audio: Buffer.from(audio) } })
    .catch(err => console.error('[tts-cache] write failed:', err))
  return audio
}
