import crypto from 'crypto'
import db from '@/lib/db'
import { generateAudio, resolveVoiceId } from '@/lib/tts'

const DEFAULT_HOOK = "Could I start by taking your full name please?"

// Patterns that indicate the custom greetingMessage already contains a greeting intro —
// in that case we discard it and just use the default hook to avoid doubling up.
const INTRO_RE = /^(hello|hi|good\s+(morning|afternoon|evening)|thank\s+you\s+for\s+calling|thanks\s+for\s+calling)/i

type BusinessForGreeting = {
  name: string
  receptionistName: string | null
  receptionistVoice?: string | null
  receptionistGender?: string | null
  receptionistAccent?: string | null
  settings?: { greetingMessage?: string | null } | null
}

export function buildGreetingText(business: BusinessForGreeting): string {
  const name = business.receptionistName
  const bizName = business.name

  // Use the custom message as the hook only if it isn't itself an intro and doesn't
  // already mention the receptionist's name (both would cause doubling)
  const custom = business.settings?.greetingMessage?.trim()
  const nameAlreadyInCustom = Boolean(name && custom && custom.toLowerCase().includes(name.toLowerCase()))
  const hook = custom && !INTRO_RE.test(custom) && !nameAlreadyInCustom ? custom : DEFAULT_HOOK

  // GDPR Article 13 disclosure is delivered by the AI mid-conversation (after name collected)
  if (name) {
    return `Hello, thank you for calling ${bizName}! I'm ${name}. ${hook}`
  }
  return `Hello, thank you for calling ${bizName}! ${hook}`
}

export function computeGreetingHash(text: string, voiceId: string): string {
  return crypto.createHash('sha256').update(`${text}|${voiceId}`).digest('hex').slice(0, 16)
}

export async function generateAndCacheGreeting(businessId: string): Promise<void> {
  const business = await db.business.findUnique({
    where: { id: businessId },
    include: { settings: true },
  })
  if (!business) return

  const text = buildGreetingText(business)
  const voiceId = resolveVoiceId({
    receptionistVoice: business.receptionistVoice,
    receptionistGender: business.receptionistGender,
    receptionistAccent: business.receptionistAccent,
  })
  const hash = computeGreetingHash(text, voiceId)

  if (business.greetingAudioHash === hash && business.greetingAudioMp3) return

  try {
    const buffer = await generateAudio(text, voiceId)
    await db.business.update({
      where: { id: businessId },
      data: {
        greetingAudioMp3: Buffer.from(buffer),
        greetingAudioHash: hash,
      },
    })
    console.log(`[greeting-cache] cached greeting for business ${businessId}`)
  } catch (err) {
    console.error('[greeting-cache] generation failed:', err)
  }
}
