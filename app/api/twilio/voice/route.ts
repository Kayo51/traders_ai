import { NextRequest } from 'next/server'
import db from '@/lib/db'
import { chat } from '@/lib/ai/receptionist'
import { gatherResponse, errorResponse } from '@/lib/twiml'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const callSid = form.get('CallSid') as string
    const to = form.get('To') as string
    const from = form.get('From') as string

    // Resolve business by the number that was dialled, fall back to dev seed
    let business = await db.business.findFirst({
      where: { twilioPhoneNumber: to },
    })

    if (!business && process.env.DEV_BUSINESS_ID) {
      business = await db.business.findUnique({
        where: { id: process.env.DEV_BUSINESS_ID },
      })
    }

    if (!business) {
      return errorResponse()
    }

    // Get AI greeting
    const result = await chat([])
    const greeting = result.reply

    // Persist call + conversation
    const call = await db.call.create({
      data: {
        businessId: business.id,
        twilioCallSid: callSid,
        callerPhone: from,
        status: 'IN_PROGRESS',
      },
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
    return gatherResponse(greeting, gatherUrl)
  } catch (err) {
    console.error('[twilio/voice]', err)
    return errorResponse()
  }
}
