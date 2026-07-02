import crypto from 'crypto'
import db from '@/lib/db'
import { generateAudio, resolveVoiceId } from '@/lib/tts'

const DEFAULT_GREETING = "Hello, thanks for calling! Could I start by taking your full name please?"

type BusinessForGreeting = {
  name: string
  receptionistName: string | null
  receptionistVoice?: string | null
  receptionistGender?: string | null
  receptionistAccent?: string | null
  settings?: { greetingMessage?: string | null } | null
}

export function buildGreetingText(business: BusinessForGreeting): string {
  const baseMsg = business.settings?.greetingMessage?.trim() || DEFAULT_GREETING
  const name = business.receptionistName
  const bizName = business.name
  // Only skip the intro prefix if the receptionist name itself is already in the greeting
  const alreadyNamed = Boolean(name && baseMsg.includes(name))

  // UK GDPR Article 13: callers must be told at the point of data collection
  // that this is an AI and their details will be stored to process their enquiry.
  if (!alreadyNamed && name) {
    return `Hi, this is ${name} from ${bizName}, your AI receptionist. Your details will be stored to handle your enquiry. ${baseMsg}`
  }
  return `Please note this call is handled by an AI assistant and your details will be stored to process your enquiry. ${baseMsg}`
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
