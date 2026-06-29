import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import { generateAudio } from '@/lib/tts'
import { storeAudio } from '@/lib/audio-cache'
import { gatherResponse, hangupResponse } from '@/lib/twiml'

const YES_PATTERN = /\b(yes|yeah|yep|yup|please|actually|there is|something else|one more|also|and|sure|go on|what about)\b/i

const qaUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/qa`

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const speech = (form.get('SpeechResult') as string | null)?.trim() ?? ''

  const audioId = randomUUID()

  if (YES_PATTERN.test(speech)) {
    const text = "Of course! What would you like to know?"
    await generateAudio(text).then(buf => storeAudio(audioId, buf))
    return gatherResponse(audioId, qaUrl)
  }

  const text = "Perfect. The plumber will be in touch very soon. Take care, goodbye!"
  await generateAudio(text).then(buf => storeAudio(audioId, buf))
  return hangupResponse(audioId)
}
