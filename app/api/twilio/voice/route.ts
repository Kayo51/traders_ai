import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import db from '@/lib/db'
import { generateAudio } from '@/lib/tts'
import { storeAudio } from '@/lib/audio-cache'
import { gatherResponse, errorResponse } from '@/lib/twiml'

const GREETING = "Hello, thanks for calling! Could I start by taking your full name please?"

// Pre-generate greeting audio when the server starts so the first call is instant
let cachedGreetingId: string | null = null
generateAudio(GREETING)
  .then(buf => {
    const id = randomUUID()
    storeAudio(id, buf)
    cachedGreetingId = id
  })
  .catch(err => console.error('[voice] greeting pre-warm failed:', err))

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const callSid = form.get('CallSid') as string
    const to = form.get('To') as string
    const from = form.get('From') as string

    // Resolve business by the number dialled, fall back to dev seed
    let business = await db.business.findFirst({
      where: { twilioPhoneNumber: to },
    })

    if (!business && process.env.DEV_BUSINESS_ID) {
      business = await db.business.findUnique({
        where: { id: process.env.DEV_BUSINESS_ID },
      })
    }

    if (!business) return errorResponse()

    // Use pre-cached greeting or generate fresh if cache miss
    let audioId = cachedGreetingId
    if (!audioId) {
      audioId = randomUUID()
      const buf = await generateAudio(GREETING)
      storeAudio(audioId, buf)
    }

    // Refresh the cache for next call
    generateAudio(GREETING)
      .then(buf => {
        const id = randomUUID()
        storeAudio(id, buf)
        cachedGreetingId = id
      })
      .catch(() => {})

    // Persist call + conversation
    const call = await db.call.create({
      data: { businessId: business.id, twilioCallSid: callSid, callerPhone: from, status: 'IN_PROGRESS' },
    })

    await db.conversation.create({
      data: {
        businessId: business.id,
        callId: call.id,
        twilioCallSid: callSid,
        messages: [{ role: 'assistant', content: GREETING }],
        currentStep: 'GREETING',
      },
    })

    const gatherUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/gather`
    return gatherResponse(audioId, gatherUrl)
  } catch (err) {
    console.error('[twilio/voice]', err)
    return errorResponse()
  }
}
