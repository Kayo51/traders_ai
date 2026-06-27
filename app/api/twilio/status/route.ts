import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { CallStatus } from '@prisma/client'

const STATUS_MAP: Record<string, CallStatus> = {
  completed: 'COMPLETED',
  failed: 'FAILED',
  busy: 'FAILED',
  'no-answer': 'NO_ANSWER',
  canceled: 'FAILED',
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const callSid = form.get('CallSid') as string
    const callStatus = form.get('CallStatus') as string
    const duration = form.get('CallDuration') as string | null

    const status = STATUS_MAP[callStatus]
    if (!status) return new NextResponse(null, { status: 204 })

    await db.call.update({
      where: { twilioCallSid: callSid },
      data: {
        status,
        durationSeconds: duration ? parseInt(duration, 10) : null,
      },
    })
  } catch (err) {
    console.error('[twilio/status]', err)
  }

  return new NextResponse(null, { status: 204 })
}
