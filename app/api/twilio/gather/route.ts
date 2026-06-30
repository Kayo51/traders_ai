import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import db from '@/lib/db'
import { chat, type Message } from '@/lib/ai/receptionist'
import { generateAudio } from '@/lib/tts'
import { storeAudio } from '@/lib/audio-cache'
import { sendLeadNotifications, sendCallerConfirmation } from '@/lib/notifications'
import { gatherResponse, hangupResponse, errorResponse } from '@/lib/twiml'
import { normaliseUKPhone, isPresenceCheck } from '@/lib/phone-utils'
import { getAvailableSlots, buildSlotOffer } from '@/lib/calendar'
import { markCallCompleted } from '@/lib/call-utils'

const MAX_EMPTY_RETRIES = 3

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const callSid = form.get('CallSid') as string
    const speechResult = form.get('SpeechResult') as string | null

    const conversation = await db.conversation.findUnique({
      where: { twilioCallSid: callSid },
      include: { business: { include: { settings: true } } },
    })

    if (!conversation) return errorResponse()

    const gatherUrl   = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/gather`
    const farewellUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/farewell`
    const bookingUrl  = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/booking`

    const meta = (conversation.collectedData as Record<string, unknown>) ?? {}

    // ── No speech captured ──────────────────────────────────────────────────
    if (!speechResult?.trim()) {
      const emptyCount = ((meta.emptyRetries as number) ?? 0) + 1

      // After 3 silent attempts, give up gracefully
      if (emptyCount >= MAX_EMPTY_RETRIES) {
        const audioId = randomUUID()
        await Promise.all([
          generateAudio("I'm sorry, I'm having trouble hearing you. Please try calling back when you're in a quieter spot. Goodbye!").then(buf => storeAudio(audioId, buf)),
          markCallCompleted(callSid),
        ])
        return hangupResponse(audioId)
      }

      // Replay last assistant message with a gentle prompt
      const lastAssistant = (conversation.messages as Message[])
        .filter(m => m.role === 'assistant')
        .at(-1)

      const retry = emptyCount === 1
        ? `Sorry, I didn't quite catch that. ${lastAssistant?.content ?? 'Could you say that again?'}`
        : `I'm still having trouble hearing you. Could you speak up a little? ${lastAssistant?.content ?? ''}`

      const audioId = randomUUID()
      await Promise.all([
        generateAudio(retry).then(buf => storeAudio(audioId, buf)),
        db.conversation.update({
          where: { id: conversation.id },
          data: { collectedData: { ...meta, emptyRetries: emptyCount } },
        }),
      ])
      return gatherResponse(audioId, gatherUrl)
    }

    // Speech received — reset the empty-retry counter
    const cleanMeta = { ...meta, emptyRetries: 0 }

    // ── Presence check ("hello? you still there?") ──────────────────────────
    if (isPresenceCheck(speechResult)) {
      const lastAssistant = (conversation.messages as Message[])
        .filter(m => m.role === 'assistant')
        .at(-1)
      const reply = `Hey, I'm still here! Sorry if there was a pause. ${lastAssistant?.content ?? 'Could you say that again please?'}`
      const audioId = randomUUID()
      await generateAudio(reply).then(buf => storeAudio(audioId, buf))
      return gatherResponse(audioId, gatherUrl)
    }

    // ── Build history and call AI ───────────────────────────────────────────
    const history = conversation.messages as Message[]
    const updatedMessages: Message[] = [...history, { role: 'user', content: speechResult }]
    const result = await chat(updatedMessages)
    const newMessages: Message[] = [...updatedMessages, { role: 'assistant', content: result.reply }]

    // Pre-generate audio and save conversation in parallel
    const audioId = randomUUID()
    await Promise.all([
      generateAudio(result.reply).then(buf => storeAudio(audioId, buf)),
      db.conversation.update({
        where: { id: conversation.id },
        data: {
          messages: newMessages,
          collectedData: cleanMeta,
          isComplete: result.complete,
          currentStep: result.complete ? 'COMPLETE' : conversation.currentStep,
        },
      }),
    ])

    if (result.complete) {
      const lead = await db.lead.create({
        data: {
          businessId: conversation.businessId,
          callId: conversation.callId,
          callerName: result.lead.name,
          callerPhone: normaliseUKPhone(result.lead.phone),
          postcode: result.lead.postcode.toUpperCase(),
          description: result.lead.issue,
          urgency: result.lead.urgency as any,
        },
      })

      sendCallerConfirmation(lead, conversation.business)
        .catch(err => console.error('[gather] caller SMS error:', err))

      if (conversation.business.settings) {
        sendLeadNotifications({
          lead,
          business: conversation.business,
          settings: conversation.business.settings,
        }).catch(err => console.error('[gather] notification error:', err))
      }

      // Set first follow-up time based on business settings
      const firstDelay = conversation.business.settings
        ? (() => {
            try {
              const d = JSON.parse(conversation.business.settings.followUpDelays as string)
              return Array.isArray(d) ? Number(d[0]) : 5
            } catch { return 5 }
          })()
        : 5

      const nextFollowUpAt = conversation.business.settings?.customerFollowUpEnabled !== false
        ? new Date(lead.createdAt.getTime() + firstDelay * 3600000)
        : null

      if (nextFollowUpAt) {
        await db.lead.update({
          where: { id: lead.id },
          data: { nextFollowUpAt },
        })
      }

      // ── Booking flow ─────────────────────────────────────────────────────
      const s = conversation.business.settings
      if (s?.bookingEnabled && s.googleAccessToken && s.googleRefreshToken) {
        try {
          const slots = await getAvailableSlots(s as any, conversation.businessId)
          if (slots.length > 0) {
            const offerText = buildSlotOffer(slots)
            const bookingAudioId = randomUUID()
            await Promise.all([
              generateAudio(offerText).then(buf => storeAudio(bookingAudioId, buf)),
              db.conversation.update({
                where: { id: conversation.id },
                data: { collectedData: { ...cleanMeta, bookingSlots: slots } },
              }),
            ])
            return gatherResponse(bookingAudioId, bookingUrl)
          }
        } catch (err) {
          console.error('[gather] booking slots error:', err)
        }
      }

      return gatherResponse(audioId, farewellUrl)
    }

    return gatherResponse(audioId, gatherUrl)
  } catch (err) {
    console.error('[twilio/gather]', err)
    return errorResponse()
  }
}
