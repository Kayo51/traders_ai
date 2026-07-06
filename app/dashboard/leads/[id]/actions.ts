'use server'
import db from '@/lib/db'
import { getCurrentBusiness } from '@/lib/onboarding'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { LeadStatus } from '@prisma/client'
import twilio from 'twilio'
import { normaliseUKPhone } from '@/lib/phone-utils'

export async function updateLeadNotes(leadId: string, notes: string) {
  const business = await getCurrentBusiness()
  if (!business) return

  await db.lead.update({
    where: { id: leadId, businessId: business.id },
    data: { notes: notes.trim() || null },
  })
  revalidatePath(`/dashboard/leads/${leadId}`)
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const business = await getCurrentBusiness()
  if (!business) return

  await db.lead.update({
    where: { id: leadId, businessId: business.id },
    data: {
      status,
      ...(status === 'CONTACTED' ? { contacted: true, contactedAt: new Date() } : {}),
    },
  })
  revalidatePath(`/dashboard/leads/${leadId}`)
}

export async function sendOnMyWay(leadId: string) {
  const business = await getCurrentBusiness()
  if (!business) return { error: 'Unauthorised' }

  const lead = await db.lead.findUnique({ where: { id: leadId, businessId: business.id } })
  if (!lead) return { error: 'Not found' }

  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from  = process.env.TWILIO_SMS_FROM ?? business.twilioPhoneNumber ?? process.env.TWILIO_FROM_NUMBER
  if (!sid || !token || !from) return { error: 'SMS not configured' }

  const firstName = lead.callerName?.split(' ')[0] ?? 'there'
  const body = `Hi ${firstName}, just to let you know ${business.name} is on the way and should be with you in around 30 minutes.`

  try {
    await twilio(sid, token).messages.create({ from, to: normaliseUKPhone(lead.callerPhone), body })
  } catch (err) {
    console.error('[sendOnMyWay] Twilio error:', err)
    return { error: 'Failed to send SMS' }
  }
  await db.lead.update({ where: { id: leadId }, data: { onMyWaySentAt: new Date() } })
  revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true }
}

export async function markLeadComplete(leadId: string) {
  const business = await getCurrentBusiness()
  if (!business) return { error: 'Unauthorised' }

  const lead = await db.lead.findUnique({
    where: { id: leadId, businessId: business.id },
    include: { business: { include: { settings: true } } },
  })
  if (!lead) return { error: 'Not found' }

  // Send Google review request SMS if Place ID is configured
  const placeId = lead.business.settings?.googlePlaceId
  let reviewSent = false

  if (placeId) {
    const sid   = process.env.TWILIO_ACCOUNT_SID
    const token = process.env.TWILIO_AUTH_TOKEN
    const from  = process.env.TWILIO_SMS_FROM ?? business.twilioPhoneNumber ?? process.env.TWILIO_FROM_NUMBER
    if (sid && token && from) {
      const firstName = lead.callerName?.split(' ')[0] ?? 'there'
      const reviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`
      const body = `Hi ${firstName}, thanks for choosing ${business.name}! If you're happy with the work, we'd love a quick Google review — it only takes a minute: ${reviewUrl} — ${business.name}`
      try {
        await twilio(sid, token).messages.create({ from, to: normaliseUKPhone(lead.callerPhone), body })
        reviewSent = true
      } catch (err) {
        console.error('[markLeadComplete] review SMS error:', err)
      }
    }
  }

  // Single DB write — combines status change and optional reviewRequestSentAt
  await db.lead.update({
    where: { id: leadId },
    data: {
      status: 'COMPLETED',
      followUpStopped: true,
      ...(reviewSent ? { reviewRequestSentAt: new Date() } : {}),
    },
  })

  revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true, reviewSent }
}

export async function markQuoteSent(leadId: string) {
  const business = await getCurrentBusiness()
  if (!business) return { error: 'Unauthorised' }

  await db.lead.update({
    where: { id: leadId, businessId: business.id },
    data: { status: 'QUOTED', quoteSentAt: new Date(), followUpStopped: true },
  })

  revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true }
}

export async function deleteLead(leadId: string) {
  const business = await getCurrentBusiness()
  if (!business) return

  // businessId scoping prevents deleting another tenant's lead
  await db.lead.delete({
    where: { id: leadId, businessId: business.id },
  })

  redirect('/dashboard/leads')
}
