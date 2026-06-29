import { NextRequest } from 'next/server'
import db from '@/lib/db'

const STATUS_MAP: Record<string, string> = {
  completed:  'COMPLETED',
  busy:       'NO_ANSWER',
  'no-answer':'NO_ANSWER',
  failed:     'FAILED',
  canceled:   'FAILED',
}

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const callSid        = form.get('CallSid') as string
  const callStatus     = (form.get('CallStatus') as string ?? '').toLowerCase()
  const durationStr    = form.get('CallDuration') as string | null

  const status = STATUS_MAP[callStatus]
  if (!status || !callSid) return new Response('ok')

  await db.call.updateMany({
    where:  { twilioCallSid: callSid },
    data: {
      status: status as any,
      durationSeconds: durationStr ? parseInt(durationStr, 10) : undefined,
    },
  })

  return new Response('ok')
}
