import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function generateFollowUpMessage(opts: {
  businessName: string
  businessType?: string | null
  callerName: string | null
  issue: string | null
  followUpCount: number
}): Promise<{ sms: string; emailHtml: string; emailText: string }> {
  const firstName = opts.callerName?.split(' ')[0] ?? 'there'
  const ordinal = ['first', 'second', 'third', 'fourth', 'fifth'][opts.followUpCount] ?? `follow-up #${opts.followUpCount + 1}`

  const TRADE_NAMES: Record<string, string> = {
    PLUMBER: 'plumbing', ELECTRICIAN: 'electrical', HEATING_ENGINEER: 'heating and boiler',
    BUILDER: 'building and construction', LOCKSMITH: 'locksmith', CLEANING_COMPANY: 'cleaning', HVAC: 'HVAC',
  }
  const trade = opts.businessType ? (TRADE_NAMES[opts.businessType] ?? 'trade') : 'trade'

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: `You write warm, professional follow-up messages for ${opts.businessName}, a UK ${trade} business, to send to customers who are waiting for a callback.

The customer's first name is ${firstName}.
Their issue: ${opts.issue ?? 'a plumbing problem'}.
This is the ${ordinal} follow-up message.

IMPORTANT:
- Each message must feel slightly different from the previous ones (vary phrasing, tone, opening)
- Be warm, reassuring and concise
- Do NOT make specific promises about callback time
- Do NOT use emojis or special characters
- Keep the SMS under 160 characters
- The email can be 3-4 sentences

Output ONLY valid JSON in this exact format (no markdown, no other text):
{"sms":"SMS text here","emailText":"Plain email text here"}`,
    messages: [{ role: 'user', content: 'Generate the follow-up message.' }],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
  try {
    const parsed = JSON.parse(raw)
    const emailText = parsed.emailText ?? parsed.sms
    const emailHtml = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif"><div style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden"><div style="background:#18181b;padding:24px 32px"><p style="margin:0;color:#a1a1aa;font-size:12px;text-transform:uppercase;letter-spacing:.08em">TradeSpeak</p><h1 style="margin:4px 0 0;color:#fff;font-size:18px;font-weight:600">${opts.businessName}</h1></div><div style="padding:24px 32px"><p style="color:#374151;font-size:14px;line-height:1.6">${emailText.replace(/\n/g, '<br/>')}</p></div><div style="padding:16px 32px;border-top:1px solid #f3f4f6;background:#f9fafb"><p style="margin:0;color:#9ca3af;font-size:12px">${opts.businessName}</p></div></div></body></html>`
    return { sms: parsed.sms ?? emailText, emailHtml, emailText }
  } catch {
    const fallback = `Hi ${firstName}, just a quick update from ${opts.businessName} — your enquiry has been received and we will be in touch very soon. Thank you for your patience.`
    return {
      sms: fallback.slice(0, 160),
      emailText: fallback,
      emailHtml: `<p>${fallback}</p>`,
    }
  }
}
