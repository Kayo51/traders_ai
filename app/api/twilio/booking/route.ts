import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import db from '@/lib/db'
import { pickSlot } from '@/lib/ai/booking'
import { createBooking, buildSlotOffer, buildSlotReprompt, type CalendarSlot } from '@/lib/calendar'
import { generateAudio } from '@/lib/tts'
import { storeAudio } from '@/lib/audio-cache'
import { gatherResponse, hangupResponse, errorResponse } from '@/lib/twiml'
import { isPresenceCheck } from '@/lib/phone-utils'
import { markCallCompleted } from '@/lib/call-utils'

const bookingUrl  = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/booking`
const farewellUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/farewell`

const DECLINE_RE = /\b(no|nope|none|neither|no thanks|not sure|can't|cant|don't|wont|won't|skip|not now|maybe later|actually no|forget it)\b/i

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const callSid     = form.get('CallSid') as string
    const speechResult = (form.get('SpeechResult') as string | null)?.trim() ?? ''

    const conversation = await db.conversation.findUnique({
      where: { twilioCallSid: callSid },
      include: {
        business: { include: { settings: true } },
        call: { include: { lead: true } },
      },
    })
    if (!conversation) return errorResponse()

    const meta  = (conversation.collectedData as Record<string, unknown>) ?? {}
    const slots = (meta.bookingSlots as CalendarSlot[]) ?? []
    const lead  = conversation.call?.lead
    const audioId = randomUUID()

    // ── Presence check ────────────────────────────────────────────────────────
    if (isPresenceCheck(speechResult)) {
      const text = `Hey, I'm still here! ${buildSlotReprompt(slots)}`
      await generateAudio(text).then(buf => storeAudio(audioId, buf))
      return gatherResponse(audioId, bookingUrl)
    }

    // ── No speech / first arrival from gather ─────────────────────────────────
    if (!speechResult) {
      const retries = ((meta.bookingRetries as number) ?? 0) + 1
      if (retries > 3) {
        const text = "No problem — the plumber will give you a ring to arrange a time. Let me wrap things up."
        await generateAudio(text).then(buf => storeAudio(audioId, buf))
        return gatherResponse(audioId, farewellUrl)
      }
      const text = retries === 1 ? buildSlotOffer(slots) : buildSlotReprompt(slots)
      await Promise.all([
        generateAudio(text).then(buf => storeAudio(audioId, buf)),
        db.conversation.update({ where: { id: conversation.id }, data: { collectedData: { ...meta, bookingRetries: retries } } }),
      ])
      return gatherResponse(audioId, bookingUrl)
    }

    // ── Caller declining ──────────────────────────────────────────────────────
    if (DECLINE_RE.test(speechResult)) {
      const text = "No worries at all! The plumber will call you to arrange a time. Is there anything else I can help with?"
      await generateAudio(text).then(buf => storeAudio(audioId, buf))
      return gatherResponse(audioId, farewellUrl)
    }

    // ── Try to identify the chosen slot ──────────────────────────────────────
    const slotIndex = await pickSlot(speechResult, slots)

    if (slotIndex === null) {
      const retries = ((meta.bookingRetries as number) ?? 0) + 1
      if (retries > 3) {
        const text = "Sorry I keep mishearing you! The plumber will call to arrange a time directly. Let me finish up."
        await generateAudio(text).then(buf => storeAudio(audioId, buf))
        return gatherResponse(audioId, farewellUrl)
      }
      const text = buildSlotReprompt(slots)
      await Promise.all([
        generateAudio(text).then(buf => storeAudio(audioId, buf)),
        db.conversation.update({ where: { id: conversation.id }, data: { collectedData: { ...meta, bookingRetries: retries } } }),
      ])
      return gatherResponse(audioId, bookingUrl)
    }

    // ── Book the slot ─────────────────────────────────────────────────────────
    const chosenSlot = slots[slotIndex]

    try {
      const settings = conversation.business.settings!
      const eventId = await createBooking(
        settings as any,
        conversation.businessId,
        chosenSlot,
        lead?.callerName ?? null,
        lead?.description ?? null,
      )

      if (lead) {
        await db.lead.update({
          where: { id: lead.id },
          data: {
            status:           'BOOKED',
            appointmentStart: new Date(chosenSlot.start),
            appointmentEnd:   new Date(chosenSlot.end),
            googleEventId:    eventId,
          },
        })
      }

      const text = `Perfect! You're booked in for ${chosenSlot.label}. The plumber will also give you a call as soon as possible to confirm. Is there anything else I can help you with before I let you go?`
      await generateAudio(text).then(buf => storeAudio(audioId, buf))
      return gatherResponse(audioId, farewellUrl)
    } catch (err) {
      console.error('[booking] calendar error:', err)
      const text = "I'm sorry, there was a problem securing that slot. The plumber will contact you directly to arrange a time."
      await generateAudio(text).then(buf => storeAudio(audioId, buf))
      return gatherResponse(audioId, farewellUrl)
    }
  } catch (err) {
    console.error('[twilio/booking]', err)
    return errorResponse()
  }
}
