import { NextRequest } from 'next/server'
import db from '@/lib/db'
import twilio from 'twilio'
import { Resend } from 'resend'
import { normaliseUKPhone } from '@/lib/phone-utils'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const secret = bearer ?? req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Window boundaries for each reminder type.
  // Cron runs hourly so we use a ±90-min window to ensure no appointment falls
  // between two consecutive runs without being caught.
  const window24hStart = new Date(now.getTime() + 22.5 * 60 * 60 * 1000)
  const window24hEnd   = new Date(now.getTime() + 25.5 * 60 * 60 * 1000)
  const window5hStart  = new Date(now.getTime() +  3.5 * 60 * 60 * 1000)
  const window5hEnd    = new Date(now.getTime() +  6.5 * 60 * 60 * 1000)

  const leads = await db.lead.findMany({
    where: {
      appointmentStart: { not: null },
      OR: [
        { appointmentStart: { gte: window24hStart, lte: window24hEnd }, reminder24hSentAt: null },
        { appointmentStart: { gte: window5hStart,  lte: window5hEnd  }, reminder5hSentAt:  null },
      ],
    },
    include: { business: { include: { settings: true } } },
  })

  const twilioSid   = process.env.TWILIO_ACCOUNT_SID
  const twilioToken = process.env.TWILIO_AUTH_TOKEN
  const twilioClient = twilioSid && twilioToken ? twilio(twilioSid, twilioToken) : null

  let sent = 0

  for (const lead of leads) {
    const { business } = lead
    const settings = business.settings
    const apptStart = lead.appointmentStart!

    const notifyPhone = settings?.notifyPhone
    const notifyEmail = settings?.notifyEmail

    const is24h = apptStart >= window24hStart && apptStart <= window24hEnd && !lead.reminder24hSentAt
    const is5h  = apptStart >= window5hStart  && apptStart <= window5hEnd  && !lead.reminder5hSentAt

    const label = is5h ? '5 hours' : '24 hours'

    const apptFormatted = apptStart.toLocaleString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London',
    })

    const smsBody =
      `🗓 Appointment in ${label}\n` +
      `Customer: ${lead.callerName ?? 'Unknown'}\n` +
      `Job: ${lead.jobType ?? lead.description ?? '—'}\n` +
      `When: ${apptFormatted}\n` +
      `Postcode: ${lead.postcode ?? '—'}\n` +
      `📞 Tap to call: ${lead.callerPhone}`

    const firstName = lead.callerName?.split(' ')[0] ?? 'Customer'
    const emailHtml =
      `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif">` +
      `<div style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">` +
      `<div style="background:#18181b;padding:24px 32px">` +
      `<p style="margin:0;color:#a1a1aa;font-size:12px;text-transform:uppercase;letter-spacing:.08em">JobBell</p>` +
      `<h1 style="margin:4px 0 0;color:#fff;font-size:20px;font-weight:600">Appointment in ${label}</h1>` +
      `</div>` +
      `<div style="padding:24px 32px">` +
      `<table style="width:100%;border-collapse:collapse;font-size:14px">` +
      `<tr><td style="padding:8px 16px 8px 0;color:#6b7280;white-space:nowrap">Customer</td><td style="padding:8px 0;font-weight:500;color:#111827">${lead.callerName ?? 'Unknown'}</td></tr>` +
      `<tr><td style="padding:8px 16px 8px 0;color:#6b7280;white-space:nowrap">Job</td><td style="padding:8px 0;font-weight:500;color:#111827">${lead.jobType ?? lead.description ?? '—'}</td></tr>` +
      `<tr><td style="padding:8px 16px 8px 0;color:#6b7280;white-space:nowrap">When</td><td style="padding:8px 0;font-weight:600;color:#111827">${apptFormatted}</td></tr>` +
      `<tr><td style="padding:8px 16px 8px 0;color:#6b7280;white-space:nowrap">Postcode</td><td style="padding:8px 0;font-weight:500;color:#111827">${lead.postcode ?? '—'}</td></tr>` +
      `</table>` +
      `</div>` +
      `<div style="padding:24px 32px;border-top:1px solid #f3f4f6">` +
      `<a href="tel:${lead.callerPhone}" style="display:inline-block;background:#18181b;color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none">` +
      `📞 Call ${firstName} now` +
      `</a>` +
      `<p style="margin:12px 0 0;color:#9ca3af;font-size:12px">Sent by JobBell — ${business.name}</p>` +
      `</div>` +
      `</div></body></html>`

    try {
      // SMS to business owner
      if (notifyPhone && twilioClient) {
        const from = process.env.TWILIO_SMS_FROM ?? business.twilioPhoneNumber ?? process.env.TWILIO_FROM_NUMBER
        if (from) {
          await twilioClient.messages.create({
            from,
            to: normaliseUKPhone(notifyPhone),
            body: smsBody,
          })
        }
      }

      // Email to business owner
      if (notifyEmail && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? 'noreply@resend.dev',
          to: notifyEmail,
          subject: `Appointment in ${label} — ${lead.callerName ?? 'Customer'} (${apptFormatted})`,
          html: emailHtml,
        })
      }

      // Mark reminder as sent
      await db.lead.update({
        where: { id: lead.id },
        data: {
          ...(is24h ? { reminder24hSentAt: now } : {}),
          ...(is5h  ? { reminder5hSentAt:  now } : {}),
        },
      })

      sent++
    } catch (err) {
      console.error(`[appointment-reminders] Failed for lead ${lead.id}:`, err)
    }
  }

  return Response.json({ checked: leads.length, sent, at: now.toISOString() })
}
