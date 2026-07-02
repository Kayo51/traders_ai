import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateAudio, resolveVoiceId } from '@/lib/tts'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { greeting, gender, accent, businessName, receptionistName } = await req.json()

  const voiceId = resolveVoiceId({
    receptionistVoice: null,
    receptionistGender: gender ?? null,
    receptionistAccent: accent ?? null,
  })

  const name = (receptionistName as string | null)?.trim()
  const biz  = (businessName as string | null)?.trim()

  // Keep preview short to minimise credit usage — just the intro line
  const intro = name && biz
    ? `Hi, this is ${name} from ${biz}. How can I help you today?`
    : name
    ? `Hi, this is ${name}. How can I help you today?`
    : biz
    ? `Thanks for calling ${biz}. How can I help you today?`
    : ((greeting as string) ?? 'Hello, how can I help you today?').slice(0, 80)

  try {
    const audio = await generateAudio(intro, voiceId)
    return new NextResponse(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audio.byteLength),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'TTS failed'
    const isQuota = message.includes('quota_exceeded')
    return NextResponse.json(
      { error: isQuota ? 'ElevenLabs credits exhausted — top up at elevenlabs.io/subscription' : message },
      { status: 402 }
    )
  }
}
