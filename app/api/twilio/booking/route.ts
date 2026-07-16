import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import db from '@/lib/db'
import { pickSlot } from '@/lib/ai/booking'
import { createBooking, computeDayWindows, buildWindowOffer, buildWindowReprompt, buildWindowUnavailable, type CalendarSlot } from '@/lib/calendar'

import { generateAudioCached, resolveVoiceId } from '@/lib/tts'
import { storeAudio } from '@/lib/audio-cache'
import { gatherResponse, hangupResponse, errorResponse } from '@/lib/twiml'
import { isPresenceCheck } from '@/lib/phone-utils'
import { markCallCompleted } from '@/lib/call-utils'

const bookingUrl  = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/booking`
const farewellUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/farewell`

// Catches explicit declines and any expression of wanting to wait for the plumber to call back
const DECLINE_RE = /\b(no|nope|none|neither|no thanks|not sure|can't|cant|don't|wont|won't|skip|not now|maybe later|actually no|forget it)\b/i
const WAIT_FOR_CALL_RE = /\b(wait|waiting|call.*back|call me back|callback|call me|ring me|give.*ring|have.*call|have.*ring|plumber.*call|them.*call|they.*call|someone.*call|prefer.*call|rather.*call|rather.*wait|just.*call|let.*call|arrange.*later|speak.*direct|speak.*them|just.*wait|i.ll wait|i will wait)\b/i

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

    const voiceId = resolveVoiceId({
      receptionistVoice: conversation.business.receptionistVoice,
      receptionistGender: conversation.business.receptionistGender,
      receptionistAccent: conversation.business.receptionistAccent,
    })

    const meta    = (conversation.collectedData as Record<string, unknown>) ?? {}
    const slots   = (meta.bookingSlots as CalendarSlot[]) ?? []
    const windows = computeDayWindows(slots)
    const lead    = conversation.call?.lead
    const audioId = randomUUID()

    // ── Presence check ────────────────────────────────────────────────────────
    if (isPresenceCheck(speechResult)) {
      const text = `Hey, I'm still here! ${buildWindowReprompt(windows)}`
      await generateAudioCached(text, voiceId).then(buf => storeAudio(audioId, buf))
      return gatherResponse(audioId, bookingUrl)
    }

    // ── No speech / first arrival from gather ─────────────────────────────────
    if (!speechResult) {
      const retries = ((meta.bookingRetries as number) ?? 0) + 1
      if (retries > 3) {
        const text = "No problem — the plumber will give you a ring to arrange a time. Let me wrap things up."
        await generateAudioCached(text, voiceId).then(buf => storeAudio(audioId, buf))
        return gatherResponse(audioId, farewellUrl)
      }
      const text = retries === 1 ? buildWindowOffer(windows) : buildWindowReprompt(windows)
      await Promise.all([
        generateAudioCached(text, voiceId).then(buf => storeAudio(audioId, buf)),
        db.conversation.update({ where: { id: conversation.id }, data: { collectedData: { ...meta, bookingRetries: retries } } }),
      ])
      return gatherResponse(audioId, bookingUrl)
    }

    // ── Caller wants plumber to call instead ──────────────────────────────────
    if (DECLINE_RE.test(speechResult) || WAIT_FOR_CALL_RE.test(speechResult)) {
      const text = "No worries at all! The plumber will call you to arrange a time. Is there anything else I can help with?"
      await generateAudioCached(text, voiceId).then(buf => storeAudio(audioId, buf))
      return gatherResponse(audioId, farewellUrl)
    }

    // ── Try to identify the chosen slot ──────────────────────────────────────
    const slotIndex = await pickSlot(speechResult, slots)

    if (slotIndex === 'unavailable') {
      // Caller named a specific time that isn't free — tell them what IS available
      const retries = ((meta.bookingRetries as number) ?? 0) + 1
      const text = retries > 2
        ? "That's no problem — the plumber will give you a call to arrange a time. Is there anything else I can help with?"
        : buildWindowUnavailable(windows)
      await Promise.all([
        generateAudioCached(text, voiceId).then(buf => storeAudio(audioId, buf)),
        db.conversation.update({ where: { id: conversation.id }, data: { collectedData: { ...meta, bookingRetries: retries } } }),
      ])
      return retries > 2 ? gatherResponse(audioId, farewellUrl) : gatherResponse(audioId, bookingUrl)
    }

    if (slotIndex === null) {
      const retries = ((meta.bookingRetries as number) ?? 0) + 1
      if (retries > 3) {
        const text = "That's no problem — the plumber will give you a call to arrange a time. Is there anything else I can help with?"
        await generateAudioCached(text, voiceId).then(buf => storeAudio(audioId, buf))
        return gatherResponse(audioId, farewellUrl)
      }
      const text = buildWindowReprompt(windows)
      await Promise.all([
        generateAudioCached(text, voiceId).then(buf => storeAudio(audioId, buf)),
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
      await generateAudioCached(text, voiceId).then(buf => storeAudio(audioId, buf))
      return gatherResponse(audioId, farewellUrl)
    } catch (err) {
      console.error('[booking] calendar error:', err)
      const text = "I'm sorry, there was a problem securing that slot. The plumber will contact you directly to arrange a time."
      await generateAudioCached(text, voiceId).then(buf => storeAudio(audioId, buf))
      return gatherResponse(audioId, farewellUrl)
    }
  } catch (err) {
    console.error('[twilio/booking]', err)
    return errorResponse()
  }
}
