'use server'

import { redirect } from 'next/navigation'
import db from '@/lib/db'
import { getCurrentBusiness, ensureUserAndBusiness, generateSimulatedNumber } from '@/lib/onboarding'

export async function selectPlan(
  plan: 'ESSENTIAL' | 'PROFESSIONAL' | 'ENTERPRISE',
  trial = false,
  billingPeriod: 'MONTHLY' | 'ANNUAL' = 'MONTHLY',
) {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  cookieStore.set('billingPeriod', billingPeriod, { path: '/', httpOnly: true, sameSite: 'lax' })

  const trialEndsAt = trial
    ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    : undefined
  await ensureUserAndBusiness(plan, trialEndsAt)
  redirect('/onboarding/number')
}

export async function assignNumber() {
  const business = await getCurrentBusiness()
  if (!business) throw new Error('No business found')

  if (business.twilioPhoneNumber) {
    return { number: business.twilioPhoneNumber }
  }

  let phoneNumber: string
  let numberSid: string

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = (await import('twilio')).default
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL!
      const country = process.env.TWILIO_COUNTRY ?? 'US'

      const available = await client.availablePhoneNumbers(country).local.list({ limit: 1 })
      if (!available.length) throw new Error(`No ${country} numbers available`)

      const createParams: Record<string, string> = {
        phoneNumber: available[0].phoneNumber,
        voiceUrl: `${appUrl}/api/twilio/voice`,
        voiceMethod: 'POST',
        statusCallback: `${appUrl}/api/twilio/status`,
        statusCallbackMethod: 'POST',
      }

      if (country !== 'US' && process.env.TWILIO_BUNDLE_SID) createParams.bundleSid = process.env.TWILIO_BUNDLE_SID
      if (country !== 'US' && process.env.TWILIO_ADDRESS_SID) createParams.addressSid = process.env.TWILIO_ADDRESS_SID

      const purchased = await client.incomingPhoneNumbers.create(createParams as any)
      phoneNumber = purchased.phoneNumber
      numberSid = purchased.sid
    } catch (err) {
      console.error('[assignNumber] Twilio failed, using simulation:', err)
      phoneNumber = generateSimulatedNumber()
      numberSid = `SIM_${Date.now()}`
    }
  } else {
    phoneNumber = generateSimulatedNumber()
    numberSid = `SIM_${Date.now()}`
  }

  await db.business.update({
    where: { id: business.id },
    data: { twilioPhoneNumber: phoneNumber, twilioNumberSid: numberSid },
  })

  return { number: phoneNumber }
}

export async function saveSetup(formData: FormData) {
  const business = await getCurrentBusiness()
  if (!business) redirect('/onboarding/plan')

  const businessName = (formData.get('businessName') as string).trim()
  const businessType = formData.get('businessType') as string
  const businessPhone = (formData.get('businessPhone') as string).trim()
  const openingHoursText = (formData.get('openingHoursText') as string).trim()
  const emergencyService = formData.get('emergencyService') === 'on'
  const receptionistName = (formData.get('receptionistName') as string).trim()
  const receptionistVoice = formData.get('receptionistVoice') as string
  const receptionistGender = formData.get('receptionistGender') as string
  const receptionistAccent = formData.get('receptionistAccent') as string
  const receptionistTone = formData.get('receptionistTone') as string
  const greetingMessage = (formData.get('greetingMessage') as string).trim()

  await db.business.update({
    where: { id: business.id },
    data: {
      name: businessName || business.name,
      businessType: businessType as any,
      businessPhone: businessPhone || null,
      openingHoursText: openingHoursText || null,
      emergencyService,
      receptionistName: receptionistName || null,
      receptionistVoice: receptionistVoice as any,
      receptionistGender,
      receptionistAccent: receptionistAccent as any,
      receptionistTone: receptionistTone as any,
      // onboardingCompleted is set after successful payment on the complete page
    },
  })

  if (business.settings) {
    await db.businessSettings.update({
      where: { businessId: business.id },
      data: {
        greetingMessage: greetingMessage || business.settings.greetingMessage,
        notifyPhone: businessPhone || undefined,
        notifyEmail: business.ownerEmail || undefined,
      },
    })
  }

  // Trial users skip payment and go straight to complete
  if (business.trialEndsAt) {
    redirect('/onboarding/complete')
  }
  redirect('/onboarding/payment')
}

export async function simulateTestCall() {
  const business = await getCurrentBusiness()
  if (!business) throw new Error('No business found')

  const sid = `SIM_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

  const call = await db.call.create({
    data: {
      businessId: business.id,
      twilioCallSid: sid,
      callerPhone: '+447700900123',
      status: 'COMPLETED',
      durationSeconds: 47,
    },
  })

  const lead = await db.lead.create({
    data: {
      businessId: business.id,
      callId: call.id,
      callerName: 'John Smith',
      callerPhone: '+447700900123',
      jobType: 'Boiler repair',
      description: 'Boiler not producing hot water. Heard a banging noise last night.',
      postcode: 'SW1A 1AA',
      urgency: 'HIGH',
      status: 'NEW',
    },
  })

  return {
    lead: {
      id: lead.id,
      callerName: lead.callerName,
      callerPhone: lead.callerPhone,
      jobType: lead.jobType,
      description: lead.description,
      postcode: lead.postcode,
      urgency: lead.urgency,
      status: lead.status,
      createdAt: lead.createdAt.toISOString(),
    },
    call: {
      durationSeconds: call.durationSeconds,
    },
  }
}
