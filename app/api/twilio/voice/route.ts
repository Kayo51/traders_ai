import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import db from '@/lib/db'
import { generateAudio, resolveVoiceId } from '@/lib/tts'
import { storeAudio } from '@/lib/audio-cache'
import { gatherResponse, gatherResponseWithSay, errorResponse } from '@/lib/twiml'

const DEFAULT_GREETING = "Hello, thanks for calling! Could I start by taking your full name please?"

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const callSid = form.get('CallSid') as string
    const to     = form.get('To')      as string
    const from   = form.get('From')    as string

    // Resolve business by the number dialled, fall back to dev seed
    let business = await db.business.findFirst({
      where: { twilioPhoneNumber: to },
      include: { settings: true },
    })

    if (!business && process.env.DEV_BUSINESS_ID) {
      business = await db.business.findUnique({
        where: { id: process.env.DEV_BUSINESS_ID },
        include: { settings: true },
      })
    }

    if (!business) return errorResponse()

    // Build the opening greeting — prepend identity if not already in the message
    const baseMsg  = business.settings?.greetingMessage?.trim() || DEFAULT_GREETING
    const name     = business.receptionistName
    const bizName  = business.name
    const alreadyNamed = (name && baseMsg.includes(name)) || baseMsg.includes(bizName)
    const greeting = (!alreadyNamed && name)
      ? `Hi, this is ${name} from ${bizName}. ${baseMsg}`
      : baseMsg

    const voiceId = resolveVoiceId({
      receptionistVoice: business.receptionistVoice,
      receptionistGender: business.receptionistGender,
      receptionistAccent: business.receptionistAccent,
    })

    // Try ElevenLabs TTS, fall back to Twilio <Say> if quota is exhausted
    let audioId: string | null = null
    let ttsQuotaExceeded = false
    try {
      audioId = randomUUID()
      const buf = await generateAudio(greeting, voiceId)
      storeAudio(audioId, buf)
    } catch (err) {
      if (err instanceof Error && err.message.includes('quota_exceeded')) {
        ttsQuotaExceeded = true
        console.warn('[voice] ElevenLabs quota exceeded — falling back to Twilio <Say>')
      } else {
        throw err
      }
    }

    // Persist call + conversation
    const call = await db.call.create({
      data: { businessId: business.id, twilioCallSid: callSid, callerPhone: from, status: 'IN_PROGRESS' },
    })

    await db.conversation.create({
      data: {
        businessId: business.id,
        callId: call.id,
        twilioCallSid: callSid,
        messages: [{ role: 'assistant', content: greeting }],
        currentStep: 'GREETING',
      },
    })

    const gatherUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/gather`
    return ttsQuotaExceeded
      ? gatherResponseWithSay(greeting, gatherUrl)
      : gatherResponse(audioId!, gatherUrl)
  } catch (err) {
    console.error('[twilio/voice]', err)
    return errorResponse()
  }
}
