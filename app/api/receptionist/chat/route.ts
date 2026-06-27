import { NextRequest, NextResponse } from 'next/server'
import { chat, type Message } from '@/lib/ai/receptionist'
import { sendLeadNotifications } from '@/lib/notifications'
import db from '@/lib/db'

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured' },
      { status: 503 }
    )
  }

  let messages: Message[]
  try {
    const body = await req.json()
    messages = Array.isArray(body.messages) ? body.messages : []
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const result = await chat(messages)

    if (result.complete) {
      const businessId = process.env.DEV_BUSINESS_ID
      if (businessId) {
        const [lead, business] = await Promise.all([
          db.lead.create({
            data: {
              businessId,
              callerName: result.lead.name,
              callerPhone: result.lead.phone,
              postcode: result.lead.postcode,
              description: result.lead.issue,
            },
          }),
          db.business.findUnique({
            where: { id: businessId },
            include: { settings: true },
          }),
        ])

        if (business?.settings) {
          // Fire and forget — don't block the response on notifications
          sendLeadNotifications({
            lead,
            business,
            settings: business.settings,
          }).catch(err => console.error('[chat] notification error:', err))
        }

        return NextResponse.json({ ...result, leadId: lead.id })
      }
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[receptionist/chat]', err)
    return NextResponse.json(
      { error: 'AI service unavailable' },
      { status: 502 }
    )
  }
}
