import twilio from 'twilio'
import { Resend } from 'resend'
import type { Business, BusinessSettings, Lead } from '@prisma/client'

type NotifyPayload = {
  lead: Lead
  business: Business
  settings: BusinessSettings
}

export async function sendLeadNotifications(payload: NotifyPayload) {
  const results = await Promise.allSettled([
    sendSMS(payload),
    sendEmail(payload),
  ])

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[notifications] ${i === 0 ? 'SMS' : 'Email'} failed:`, r.reason)
    }
  })
}

// ─── SMS ─────────────────────────────────────────────────────────────────────

async function sendSMS({ lead, business, settings }: NotifyPayload) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = business.twilioPhoneNumber ?? process.env.TWILIO_FROM_NUMBER

  if (!sid || !token || !from) return

  const to = settings.notifyPhone ?? business.ownerPhone
  const body = formatSMS(settings.smsTemplate, lead)

  const client = twilio(sid, token)
  await client.messages.create({ from, to, body })
}

function formatSMS(template: string, lead: Lead): string {
  return template
    .replace('{name}', lead.callerName ?? 'Unknown')
    .replace('{phone}', lead.callerPhone)
    .replace('{jobType}', lead.jobType ?? lead.description ?? 'Not specified')
    .replace('{urgency}', lead.urgency.toLowerCase())
    .replace('{address}', [lead.postcode, lead.address].filter(Boolean).join(', ') || 'Not provided')
}

// ─── Email ───────────────────────────────────────────────────────────────────

async function sendEmail({ lead, business, settings }: NotifyPayload) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const to = settings.notifyEmail ?? business.ownerEmail
  const from = process.env.RESEND_FROM_EMAIL ?? 'alerts@tradeflow.ai'

  const resend = new Resend(apiKey)
  await resend.emails.send({
    from,
    to,
    subject: `New lead — ${lead.callerName ?? lead.callerPhone}`,
    html: emailHtml(lead, business),
  })
}

function emailHtml(lead: Lead, business: Business): string {
  const rows = [
    ['Name', lead.callerName ?? '—'],
    ['Phone', lead.callerPhone],
    ['Postcode', lead.postcode ?? '—'],
    ['Issue', lead.description ?? lead.jobType ?? '—'],
    ['Urgency', lead.urgency],
    ['Received', new Date(lead.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London' })],
  ]

  const tableRows = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:8px 16px 8px 0;color:#6b7280;font-size:14px;white-space:nowrap">${label}</td>
        <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500">${value}</td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
    <div style="background:#18181b;padding:24px 32px">
      <p style="margin:0;color:#a1a1aa;font-size:12px;text-transform:uppercase;letter-spacing:.08em">TradeFlow AI</p>
      <h1 style="margin:4px 0 0;color:#fff;font-size:20px;font-weight:600">New lead for ${business.name}</h1>
    </div>
    <div style="padding:24px 32px">
      <table style="width:100%;border-collapse:collapse">${tableRows}</table>
    </div>
    <div style="padding:16px 32px;border-top:1px solid #f3f4f6;background:#f9fafb">
      <p style="margin:0;color:#9ca3af;font-size:12px">Call them back as soon as possible to secure the job.</p>
    </div>
  </div>
</body>
</html>`
}
