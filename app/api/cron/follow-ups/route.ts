import { NextRequest } from 'next/server'
import db from '@/lib/db'
import { generateFollowUpMessage } from '@/lib/ai/follow-up'
import { calcNextFollowUpAt } from '@/lib/follow-up-scheduler'
import twilio from 'twilio'
import { Resend } from 'resend'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const leads = await db.lead.findMany({
    where: {
      contacted: false,
      followUpStopped: false,
      followUpEnabled: true,
      nextFollowUpAt: { lte: now },
      status: { notIn: ['COMPLETED', 'LOST'] },
    },
    include: { business: { include: { settings: true } } },
  })

  let sent = 0

  for (const lead of leads) {
    const { business } = lead
    const settings = business.settings
    if (!settings?.customerFollowUpEnabled) continue

    try {
      const { sms, emailHtml, emailText } = await generateFollowUpMessage({
        businessName: business.name,
        callerName: lead.callerName,
        issue: lead.description ?? lead.jobType,
        followUpCount: lead.followUpCount,
      })

      // Send SMS to CUSTOMER (not business owner — this is customer reassurance)
      if (settings.followUpSmsEnabled) {
        const sid = process.env.TWILIO_ACCOUNT_SID
        const token = process.env.TWILIO_AUTH_TOKEN
        const from = business.twilioPhoneNumber ?? process.env.TWILIO_FROM_NUMBER
        if (sid && token && from) {
          try {
            const client = twilio(sid, token)
            await client.messages.create({ from, to: lead.callerPhone, body: sms })
          } catch (e) {
            console.error('[follow-up] SMS error:', e)
          }
        }
      }

      // Send email to CUSTOMER
      if (settings.followUpEmailEnabled) {
        const apiKey = process.env.RESEND_API_KEY
        if (apiKey) {
          try {
            // We don't have customer email — skip email follow-up (future feature)
            // For now only SMS follow-ups go to customer
            void emailHtml
            void emailText
          } catch (e) {
            console.error('[follow-up] Email error:', e)
          }
        }
      }

      const nextFollowUpAt = calcNextFollowUpAt(lead as any, settings as any)

      await db.lead.update({
        where: { id: lead.id },
        data: {
          followUpCount: { increment: 1 },
          lastFollowUpAt: now,
          nextFollowUpAt,
          followUpStopped: !nextFollowUpAt,
        },
      })

      sent++
    } catch (err) {
      console.error(`[follow-up] Error for lead ${lead.id}:`, err)
    }
  }

  return Response.json({ processed: leads.length, sent, at: now.toISOString() })
}
