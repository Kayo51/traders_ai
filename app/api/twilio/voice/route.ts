import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import db from '@/lib/db'
import { generateAudio, resolveVoiceId } from '@/lib/tts'
import { storeAudio } from '@/lib/audio-cache'
import { buildGreetingText, computeGreetingHash } from '@/lib/greeting-cache'
import { gatherResponse, gatherResponseWithPlay, gatherResponseWithSay, errorResponse } from '@/lib/twiml'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const callSid = form.get('CallSid') as string
    const to     = form.get('To')      as string
    const from   = form.get('From')    as string

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

    const greeting = buildGreetingText(business)
    const voiceId  = resolveVoiceId({
      receptionistVoice: business.receptionistVoice,
      receptionistGender: business.receptionistGender,
      receptionistAccent: business.receptionistAccent,
    })

    const gatherUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/gather`

    // Persist call + conversation first so gather has a record to update
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

    // Check for a valid cached greeting MP3
    const expectedHash = computeGreetingHash(greeting, voiceId)
    if (business.greetingAudioHash === expectedHash && business.greetingAudioMp3) {
      const playUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/greeting-audio/${business.id}`
      return gatherResponseWithPlay(playUrl, gatherUrl)
    }

    // No valid cache — generate with ElevenLabs, then refresh cache in the background
    let audioId: string | null = null
    let ttsQuotaExceeded = false
    try {
      audioId = randomUUID()
      const buf = await generateAudio(greeting, voiceId)
      storeAudio(audioId, buf)

      // Store this generation as the new cache (fire-and-forget)
      db.business.update({
        where: { id: business.id },
        data: {
          greetingAudioMp3: Buffer.from(buf),
          greetingAudioHash: expectedHash,
        },
      }).catch(err => console.error('[voice] greeting cache write failed:', err))
    } catch (err) {
      if (err instanceof Error && err.message.includes('quota_exceeded')) {
        ttsQuotaExceeded = true
        console.warn('[voice] ElevenLabs quota exceeded — falling back to Twilio <Say>')
      } else {
        throw err
      }
    }

    return ttsQuotaExceeded
      ? gatherResponseWithSay(greeting, gatherUrl)
      : gatherResponse(audioId!, gatherUrl)
  } catch (err) {
    console.error('[twilio/voice]', err)
    return errorResponse()
  }
}
