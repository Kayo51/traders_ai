import { NextRequest } from 'next/server'
import db from '@/lib/db'
import twilio from 'twilio'
import { normaliseUKPhone } from '@/lib/phone-utils'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const secret = bearer ?? req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Chase 1: quote sent >= 3 days ago, first chase not yet sent
  const chase1Cutoff = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  // Chase 2: first chase sent >= 4 days ago (~7 days after quote), second chase not yet sent
  const chase2Cutoff = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)

  const [chase1Leads, chase2Leads] = await Promise.all([
    db.lead.findMany({
      where: { quoteSentAt: { not: null, lte: chase1Cutoff }, quoteChase1SentAt: null, status: 'QUOTED' },
      include: { business: true },
    }),
    db.lead.findMany({
      where: { quoteChase1SentAt: { not: null, lte: chase2Cutoff }, quoteChase2SentAt: null, status: 'QUOTED' },
      include: { business: true },
    }),
  ])

  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) {
    return Response.json({ error: 'Twilio credentials not configured' }, { status: 500 })
  }
  const twilioClient = twilio(sid, token)

  let sent = 0

  for (const lead of chase1Leads) {
    const biz  = lead.business
    const from = process.env.TWILIO_SMS_FROM ?? biz.twilioPhoneNumber ?? process.env.TWILIO_FROM_NUMBER
    if (!from) continue

    const firstName = lead.callerName?.split(' ')[0] ?? 'there'
    const body = `Hi ${firstName}, just checking if you had a chance to look at the quote from ${biz.name}? Happy to answer any questions — just reply to this message.`

    try {
      await twilioClient.messages.create({ from, to: normaliseUKPhone(lead.callerPhone), body })
      await db.lead.update({ where: { id: lead.id }, data: { quoteChase1SentAt: now } })
      sent++
    } catch (err) {
      console.error(`[quote-chase] chase1 failed for lead ${lead.id}:`, err)
    }
  }

  for (const lead of chase2Leads) {
    const biz  = lead.business
    const from = process.env.TWILIO_SMS_FROM ?? biz.twilioPhoneNumber ?? process.env.TWILIO_FROM_NUMBER
    if (!from) continue

    const firstName = lead.callerName?.split(' ')[0] ?? 'there'
    const body = `Hi ${firstName}, one last follow-up from ${biz.name} on the quote we sent. If you're still interested or have any questions, feel free to reply or give us a call. No worries at all if you've decided to go another way!`

    try {
      await twilioClient.messages.create({ from, to: normaliseUKPhone(lead.callerPhone), body })
      await db.lead.update({ where: { id: lead.id }, data: { quoteChase2SentAt: now } })
      sent++
    } catch (err) {
      console.error(`[quote-chase] chase2 failed for lead ${lead.id}:`, err)
    }
  }

  return Response.json({
    chase1: chase1Leads.length,
    chase2: chase2Leads.length,
    sent,
    at: now.toISOString(),
  })
}
