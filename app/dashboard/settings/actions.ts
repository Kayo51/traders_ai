'use server'
import db from '@/lib/db'
import { getCurrentBusiness } from '@/lib/onboarding'
import { revalidatePath } from 'next/cache'

export async function saveSettings(formData: FormData) {
  const business = await getCurrentBusiness()
  if (!business) return

  const delays = [0, 1, 2, 3].map(i => {
    const v = parseInt(formData.get(`followUpDelay${i}`) as string, 10)
    return isNaN(v) ? [5, 24, 36, 48][i] : v
  })

  await db.businessSettings.update({
    where: { businessId: business.id },
    data: {
      notifyPhone: (formData.get('notifyPhone') as string) || null,
      notifyEmail: (formData.get('notifyEmail') as string) || null,
      greetingMessage: formData.get('greetingMessage') as string,
      customerFollowUpEnabled: formData.get('customerFollowUpEnabled') === 'on',
      followUpSmsEnabled: formData.get('followUpSmsEnabled') === 'on',
      followUpEmailEnabled: formData.get('followUpEmailEnabled') === 'on',
      followUpDelays: delays,
      followUpMaxDays: parseInt(formData.get('followUpMaxDays') as string, 10) || 7,
      bookingEnabled:      formData.get('bookingEnabled') === 'on',
      bookingWindowDays:   parseInt(formData.get('bookingWindowDays') as string, 10) || 5,
      bookingSlotDuration: parseInt(formData.get('bookingSlotDuration') as string, 10) || 60,
      bookingHoursStart:   parseInt(formData.get('bookingHoursStart') as string, 10) || 9,
      bookingHoursEnd:     parseInt(formData.get('bookingHoursEnd') as string, 10) || 17,
    },
  })

  revalidatePath('/dashboard/settings')
}

export async function disconnectGoogleCalendar() {
  const business = await getCurrentBusiness()
  if (!business) return
  await db.businessSettings.update({
    where: { businessId: business.id },
    data: {
      googleAccessToken:  null,
      googleRefreshToken: null,
      googleTokenExpiry:  null,
      bookingEnabled:     false,
    },
  })
  revalidatePath('/dashboard/settings')
}
