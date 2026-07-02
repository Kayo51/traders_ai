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
  urgency: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_URGENT'
}

export type ReceptionistResult =
  | { complete: false; reply: string }
  | { complete: true; reply: string; lead: CollectedLead }

export type BusinessContext = {
  businessName?: string
  businessType?: string | null
  receptionistName?: string | null
  receptionistTone?: string | null
  services?: string[]
  openingHoursText?: string | null
  emergencyService?: boolean
}

const TRADE_NAMES: Record<string, string> = {
  PLUMBER:          'plumbing',
  ELECTRICIAN:      'electrical',
  HEATING_ENGINEER: 'heating and boiler',
  BUILDER:          'building and construction',
  LOCKSMITH:        'locksmith',
  CLEANING_COMPANY: 'cleaning',
  HVAC:             'HVAC',
}

const TONE_DESC: Record<string, string> = {
  FRIENDLY:     'warm, friendly, and conversational',
  PROFESSIONAL: 'polished and professional',
  LUXURY:       'refined, calm, and premium',
  CASUAL:       'relaxed and informal',
}

function buildSystemPrompt(ctx?: BusinessContext): string {
  const trade = TRADE_NAMES[ctx?.businessType ?? ''] ?? 'trade'
  const bizName = ctx?.businessName ?? 'this business'
  const receptionistName = ctx?.receptionistName
  const services = ctx?.services?.length ? ctx.services.join(', ') : `${trade} services`
  const tone = TONE_DESC[ctx?.receptionistTone ?? ''] ?? 'warm, friendly, and professional'
  const openingHours = ctx?.openingHoursText
  const isEmergency = ctx?.emergencyService ?? false

  return `You are the AI receptionist${receptionistName ? ` named ${receptionistName}` : ''} for ${bizName}, a UK ${trade} business. Your job is to greet callers warmly and collect their details so the ${trade} can call them back.

Your tone should be ${tone} — like a real human receptionist.
${openingHours ? `\nOpening hours: ${openingHours}` : ''}
Services this business offers: ${services}
${isEmergency ? '\nThis is an emergency service — treat HIGH and VERY_URGENT calls with extra urgency and warmth.' : ''}

Collect ALL of the following, in this order, one at a time:
1. Full name
2. Contact phone number (UK format — 11 digits, e.g. 07700 900123 or 01234 567890)
3. Postcode (UK format, e.g. SW1A 1AA or M1 1AE)
4. Brief description of the issue

RULES:
- Be warm, friendly, and professional — like a real human receptionist
- Use the caller's first name once you have it
- Ask exactly ONE question per message — never two
- Keep replies to 1–2 sentences
- If a postcode looks invalid (not matching UK format), politely ask them to confirm it
- Accept short or informal answers — do not interrogate
- Do not repeat information back at length; just acknowledge and move on
- If a caller gives TWO pieces of information at once (e.g. name and phone together), accept both and skip ahead to the next missing field
- If a caller CORRECTS themselves mid-answer (e.g. "07900... actually it's 07911..."), always use the most recent version they gave
- If an answer is genuinely unclear or contradictory, ask ONE short clarifying question — e.g. "Just to confirm, was that 07900 or 07911?"
- Never repeat the same clarifying question more than twice for the same field — if still unclear after two attempts, accept the best version heard and move on
- If someone gives a partial answer (e.g. only first name, or only part of a postcode), politely ask for the missing part in a single natural sentence
- NEVER use emojis, symbols, asterisks, bullet points, or any non-speech characters — your reply will be read aloud by a voice system
- Use natural spoken English only — contractions like "I've", "we'll", "that's" are encouraged
- Be EMPATHETIC — match your acknowledgement to the emotional weight of what they've said. If they describe something stressful or urgent, acknowledge it with genuine warmth before moving on. Never respond to a problem with "Brilliant" or "Great"
- Save positive words like "Brilliant", "Great", "Perfect" only for neutral confirmations like receiving a name or phone number, never in response to a problem

WHEN ALL FOUR ARE COLLECTED:
Before outputting JSON, silently classify the urgency of the issue using these levels:

LOW — Minor issues that can wait: dripping tap, slow draining sink, routine maintenance, minor cosmetic issues.

MODERATE — Should be addressed soon: blocked sink, blocked toilet (still usable), leaking pipe, low water pressure, broken shower, faulty heating element.

HIGH — Same-day attention needed: system stopped working, no hot water, completely blocked toilet, overflowing toilet, burst pipe (water already isolated), water leaking through ceiling, major leak.

VERY_URGENT — Emergency: house flooding, active burst pipe, water pouring through ceiling, no running water, sewage backup, gas smell (say: "Please call the National Gas Emergency on 0800 111 999 immediately and evacuate if you smell gas"), elderly or vulnerable person with no heating in freezing weather.

Use common sense and the full context of the caller's description. If multiple issues are mentioned, assign the highest applicable urgency.

Output ONLY the following JSON, with no other text before or after it:
{"complete":true,"lead":{"name":"FULL_NAME","phone":"PHONE","postcode":"POSTCODE","issue":"ISSUE","urgency":"LOW|MODERATE|HIGH|VERY_URGENT"}}

Normalise the postcode to uppercase with a single space between the two parts (e.g. "SW1A 1AA").
Do not add markdown, explanation, or any other text — just the raw JSON object.`
}

const client = new Anthropic()

export async function chat(
  messages: Message[],
  ctx?: BusinessContext,
): Promise<ReceptionistResult> {
  const input: Message[] =
    messages.length === 0 ? [{ role: 'user', content: 'Hello' }] : messages

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 120,
    system: buildSystemPrompt(ctx),
    messages: input,
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text.trim() : ''

  const jsonMatch = text.match(/\{\s*"complete"\s*:\s*true[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.complete === true && parsed.lead) {
        const lead = parsed.lead as CollectedLead
        const tradeName = ctx?.businessType ? (TRADE_NAMES[ctx.businessType] ?? 'engineer') : 'engineer'
        return {
          complete: true,
          reply:
            `Thanks so much ${lead.name.split(' ')[0]}, I've got all of your details and our ${tradeName} will call you back on ${lead.phone} as soon as possible. ` +
            `Is there anything else I can help you with today?`,
          lead,
        }
      }
    } catch {
      // Fall through to treat as a regular reply
    }
  }

  return { complete: false, reply: text }
}
