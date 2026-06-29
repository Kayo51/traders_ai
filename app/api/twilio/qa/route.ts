import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import db from '@/lib/db'
import { answerQuestion, buildQASystem, type QAResult } from '@/lib/ai/qa'
import type { Message } from '@/lib/ai/receptionist'
import { generateAudio } from '@/lib/tts'
import { storeAudio } from '@/lib/audio-cache'
import { gatherResponse, hangupResponse, errorResponse } from '@/lib/twiml'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const callSid = form.get('CallSid') as string
    const speechResult = (form.get('SpeechResult') as string | null)?.trim() ?? ''

    const conversation = await db.conversation.findUnique({
      where: { twilioCallSid: callSid },
      include: {
        business: true,
        call: { include: { lead: true } },
      },
    })

    if (!conversation) return errorResponse()

    const lead = conversation.call?.lead
    const systemPrompt = buildQASystem(
      conversation.business.name,
      lead?.callerName ?? null,
      lead?.description ?? null
    )

    // QA messages are stored after the main conversation in the same messages array
    // Filter to only the QA turns (after isComplete was set)
    const allMessages = conversation.messages as Message[]
    const qaMessages: Message[] = (conversation.collectedData as any)?.qaMessages ?? []

    // If no speech, reprompt (max 3 tries then end call)
    if (!speechResult) {
      const meta = (conversation.collectedData as Record<string, unknown>) ?? {}
      const qaRetries = ((meta.qaRetries as number) ?? 0) + 1
      if (qaRetries >= 3) {
        const audioId = randomUUID()
        await generateAudio("I'm sorry, I can't hear you clearly. The plumber will call you back shortly. Goodbye!").then(buf => storeAudio(audioId, buf))
        return hangupResponse(audioId)
      }
      await db.conversation.update({
        where: { id: conversation.id },
        data: { collectedData: { ...(conversation.collectedData as object), qaRetries } },
      })
      const lastReply = qaMessages.filter(m => m.role === 'assistant').at(-1)
      const retry = lastReply?.content ?? "Sorry, I didn't catch that. What would you like to know?"
      const audioId = randomUUID()
      await generateAudio(retry).then(buf => storeAudio(audioId, buf))
      return gatherResponse(audioId, `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/qa`)
    }

    const updatedQA: Message[] = [
      ...qaMessages,
      { role: 'user', content: speechResult },
    ]

    const result: QAResult = await answerQuestion(updatedQA, systemPrompt)

    const newQA: Message[] = [
      ...updatedQA,
      { role: 'assistant', content: result.reply },
    ]

    // Save QA history and pre-generate audio in parallel
    const audioId = randomUUID()
    await Promise.all([
      generateAudio(result.reply).then(buf => storeAudio(audioId, buf)),
      db.conversation.update({
        where: { id: conversation.id },
        data: {
          collectedData: { ...(conversation.collectedData as object), qaMessages: newQA },
        },
      }),
    ])

    if (result.done) {
      return hangupResponse(audioId)
    }

    return gatherResponse(audioId, `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/qa`)
  } catch (err) {
    console.error('[twilio/qa]', err)
    return errorResponse()
  }
}
