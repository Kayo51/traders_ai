import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import db from '@/lib/db'

const resend = new Resend(process.env.RESEND_API_KEY)

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, trade } = body as {
      name: string; email: string; phone: string; trade: string
    }

    if (!name || !email || !phone || !trade) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await db.demoRequest.create({ data: { name, email, phone, trade } })

    const from = process.env.RESEND_FROM_EMAIL!
    const notifyTo = process.env.DEMO_NOTIFY_EMAIL!

    const results = await Promise.allSettled([
      // Owner notification
      resend.emails.send({
        from,
        to: notifyTo,
        replyTo: email,
        subject: `Demo request — ${esc(name)} (${esc(trade)})`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0d0d0d;color:#e4e4e7;border-radius:12px">
            <h2 style="margin:0 0 4px;color:#fff;font-size:20px">New demo request</h2>
            <p style="margin:0 0 24px;color:#71717a;font-size:14px">TradeFlow AI landing page</p>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:10px 0;border-bottom:1px solid #27272a;color:#71717a;font-size:13px;width:100px">Name</td><td style="padding:10px 0;border-bottom:1px solid #27272a;color:#fff;font-size:14px;font-weight:600">${esc(name)}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #27272a;color:#71717a;font-size:13px">Email</td><td style="padding:10px 0;border-bottom:1px solid #27272a;color:#60a5fa;font-size:14px"><a href="mailto:${esc(email)}" style="color:#60a5fa;text-decoration:none">${esc(email)}</a></td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #27272a;color:#71717a;font-size:13px">Phone</td><td style="padding:10px 0;border-bottom:1px solid #27272a;color:#fff;font-size:14px"><a href="tel:${esc(phone)}" style="color:#fff;text-decoration:none">${esc(phone)}</a></td></tr>
              <tr><td style="padding:10px 0;color:#71717a;font-size:13px">Trade</td><td style="padding:10px 0;color:#fff;font-size:14px">${esc(trade)}</td></tr>
            </table>
            <div style="margin-top:28px;padding:16px;background:#18181b;border-radius:8px;border:1px solid #27272a">
              <p style="margin:0;font-size:13px;color:#71717a">Reply to this email or call <a href="tel:${esc(phone)}" style="color:#60a5fa">${esc(phone)}</a> to confirm their demo slot.</p>
            </div>
          </div>
        `,
      }),

      // Confirmation to form submitter
      resend.emails.send({
        from,
        to: email,
        subject: `We've received your request, ${esc(name.split(' ')[0])}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0d0d0d;color:#e4e4e7;border-radius:12px">
            <h2 style="margin:0 0 4px;color:#fff;font-size:20px">Thanks for reaching out, ${esc(name.split(' ')[0])}.</h2>
            <p style="margin:0 0 24px;color:#71717a;font-size:14px">TradeFlow AI</p>
            <p style="color:#a1a1aa;font-size:15px;line-height:1.7;margin:0 0 16px">
              We've received your demo request and will be in touch very shortly to walk you through how TradeFlow can work for your ${esc(trade.toLowerCase())} business.
            </p>
            <div style="margin:24px 0;padding:20px;background:#18181b;border-radius:8px;border:1px solid #27272a">
              <p style="margin:0 0 6px;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:.06em">Your details</p>
              <p style="margin:0;color:#fff;font-size:14px">${esc(name)} &middot; ${esc(phone)} &middot; ${esc(trade)}</p>
            </div>
            <p style="color:#52525b;font-size:13px;margin:0">If you have any questions, just reply to this email.</p>
          </div>
        `,
      }),
    ])

    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`[demo-request] email ${i === 0 ? 'owner' : 'submitter'} failed:`, r.reason)
      } else if (r.value.error) {
        console.error(`[demo-request] email ${i === 0 ? 'owner' : 'submitter'} error:`, r.value.error)
      }
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[demo-request]', err)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
