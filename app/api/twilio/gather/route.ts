import { NextRequest } from 'next/server'
import db from '@/lib/db'
import { chat, type Message } from '@/lib/ai/receptionist'
import { sendLeadNotifications } from '@/lib/notifications'
import { gatherResponse, hangupResponse, errorResponse } from '@/lib/twiml'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const callSid = form.get('CallSid') as string
    const speechResult = form.get('SpeechResult') as string | null

    const conversation = await db.conversation.findUnique({
      where: { twilioCallSid: callSid },
      include: { business: { include: { settings: true } } },
    })

    if (!conversation) {
      return errorResponse()
    }

    const gatherUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/gather`

    // No speech captured — prompt again
    if (!speechResult?.trim()) {
      const lastAssistant = (conversation.messages as Message[])
        .filter(m => m.role === 'assistant')
        .at(-1)
      const retry = lastAssistant?.content ?? "Sorry, I didn't catch that. Could you say that again?"
      return gatherResponse(retry, gatherUrl)
    }

    // Build history and get AI response
    const history = conversation.messages as Message[]
    const updatedMessages: Message[] = [
      ...history,
      { role: 'user', content: speechResult },
    ]

    const result = await chat(updatedMessages)

    const newMessages: Message[] = [
      ...updatedMessages,
      { role: 'assistant', content: result.reply },
    ]

    // Save updated conversation
    await db.conversation.update({
      where: { id: conversation.id },
      data: {
        messages: newMessages,
        isComplete: result.complete,
        currentStep: result.complete ? 'COMPLETE' : conversation.currentStep,
      },
    })

    if (result.complete) {
      // Save lead
      const lead = await db.lead.create({
        data: {
          businessId: conversation.businessId,
          callId: conversation.callId,
          callerName: result.lead.name,
          callerPhone: result.lead.phone,
          postcode: result.lead.postcode,
          description: result.lead.issue,
        },
      })

      // SMS + email — fire and forget
      if (conversation.business.settings) {
        sendLeadNotifications({
          lead,
          business: conversation.business,
          settings: conversation.business.settings,
        }).catch(err => console.error('[gather] notification error:', err))
      }

      return hangupResponse(result.reply)
    }

    return gatherResponse(result.reply, gatherUrl)
  } catch (err) {
    console.error('[twilio/gather]', err)
    return errorResponse()
  }
}
