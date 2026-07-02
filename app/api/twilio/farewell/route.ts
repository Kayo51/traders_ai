import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import db from '@/lib/db'
import { answerQuestion, buildQASystem } from '@/lib/ai/qa'
import type { Message } from '@/lib/ai/receptionist'
import { generateAudio } from '@/lib/tts'
import { storeAudio } from '@/lib/audio-cache'
import { gatherResponse, hangupResponse } from '@/lib/twiml'
import { isPresenceCheck } from '@/lib/phone-utils'
import { markCallCompleted } from '@/lib/call-utils'

const YES_PATTERN = /\b(yes|yeah|yep|yup|please|actually|there is|something else|one more|also|and|sure|go on|what about)\b/i
// Catches direct questions — starts with a question word OR ends with ?
const QUESTION_PATTERN = /\?$|^\s*(can|could|will|would|do|does|did|is|are|was|were|what|when|where|who|why|how)\b/i

const qaUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/qa`

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const callSid = form.get('CallSid') as string
  const speech = (form.get('SpeechResult') as string | null)?.trim() ?? ''

  const audioId = randomUUID()

  if (isPresenceCheck(speech)) {
    const text = "Hey, I'm still here! Sorry about that. Do you have any questions for the plumber before I let you go?"
    await generateAudio(text).then(buf => storeAudio(audioId, buf))
    return gatherResponse(audioId, qaUrl)
  }

  // Direct question — answer it immediately without asking them to repeat
  if (QUESTION_PATTERN.test(speech) && callSid) {
    try {
      const conversation = await db.conversation.findUnique({
        where: { twilioCallSid: callSid },
        include: { business: true, call: { include: { lead: true } } },
      })

      if (conversation) {
        const lead = conversation.call?.lead
        const systemPrompt = buildQASystem(
          conversation.business.name,
          lead?.callerName ?? null,
          lead?.description ?? null
        )
        const qaMessages: Message[] = (conversation.collectedData as any)?.qaMessages ?? []
        const updatedQA: Message[] = [...qaMessages, { role: 'user', content: speech }]
        const result = await answerQuestion(updatedQA, systemPrompt)
        const newQA: Message[] = [...updatedQA, { role: 'assistant', content: result.reply }]

        await Promise.all([
          generateAudio(result.reply).then(buf => storeAudio(audioId, buf)),
          db.conversation.update({
            where: { id: conversation.id },
            data: { collectedData: { ...(conversation.collectedData as object), qaMessages: newQA } },
          }),
        ])

        if (result.done) {
          await markCallCompleted(callSid)
          return hangupResponse(audioId)
        }
        return gatherResponse(audioId, qaUrl)
      }
    } catch (err) {
      console.error('[farewell] inline QA error:', err)
    }

    // Fallback if DB lookup failed — ask them to go ahead
    const text = "Of course! What would you like to know?"
    await generateAudio(text).then(buf => storeAudio(audioId, buf))
    return gatherResponse(audioId, qaUrl)
  }

  if (YES_PATTERN.test(speech)) {
    const text = "Of course! What would you like to know?"
    await generateAudio(text).then(buf => storeAudio(audioId, buf))
    return gatherResponse(audioId, qaUrl)
  }

  // PECR soft opt-in: inform caller a follow-up text may be sent
  const text = "Perfect. The plumber will be in touch very soon. We may send you a text to follow up — reply STOP at any time to opt out. Take care, goodbye!"
  await Promise.all([
    generateAudio(text).then(buf => storeAudio(audioId, buf)),
    markCallCompleted(callSid),
  ])
  return hangupResponse(audioId)
}
