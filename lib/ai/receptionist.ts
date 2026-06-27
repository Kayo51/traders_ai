import Anthropic from '@anthropic-ai/sdk'

export type Message = {
  role: 'user' | 'assistant'
  content: string
}

export type CollectedLead = {
  name: string
  phone: string
  postcode: string
  issue: string
}

export type ReceptionistResult =
  | { complete: false; reply: string }
  | { complete: true; reply: string; lead: CollectedLead }

const SYSTEM_PROMPT = `You are the AI receptionist for a UK plumbing business. Your job is to greet callers warmly and collect their details so the plumber can call them back.

Collect ALL of the following, in this order, one at a time:
1. Full name
2. Contact phone number (UK format — 11 digits, e.g. 07700 900123 or 01234 567890)
3. Postcode (UK format, e.g. SW1A 1AA or M1 1AE)
4. Brief description of the plumbing issue

RULES:
- Be warm, friendly, and professional — like a real human receptionist
- Use the caller's first name once you have it
- Ask exactly ONE question per message — never two
- Keep replies to 1–2 sentences
- If a postcode looks invalid (not matching UK format), politely ask them to confirm it
- Accept short or informal answers — do not interrogate
- Do not repeat information back at length; just acknowledge and move on

WHEN ALL FOUR ARE COLLECTED:
Output ONLY the following JSON, with no other text before or after it:
{"complete":true,"lead":{"name":"FULL_NAME","phone":"PHONE","postcode":"POSTCODE","issue":"ISSUE"}}

Normalise the postcode to uppercase with a single space between the two parts (e.g. "SW1A 1AA").
Do not add markdown, explanation, or any other text — just the raw JSON object.`

const client = new Anthropic()

export async function chat(messages: Message[]): Promise<ReceptionistResult> {
  const input: Message[] =
    messages.length === 0 ? [{ role: 'user', content: 'Hello' }] : messages

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: input,
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text.trim() : ''

  // Detect completion JSON — robust to minor leading/trailing whitespace
  const jsonMatch = text.match(/\{\s*"complete"\s*:\s*true[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.complete === true && parsed.lead) {
        const lead = parsed.lead as CollectedLead
        return {
          complete: true,
          reply:
            `Thanks ${lead.name.split(' ')[0]}, I've got all your details. ` +
            `The plumber will give you a call back on ${lead.phone} as soon as possible. Is there anything else I can help with?`,
          lead,
        }
      }
    } catch {
      // Fall through to treat as a regular reply
    }
  }

  return { complete: false, reply: text }
}
