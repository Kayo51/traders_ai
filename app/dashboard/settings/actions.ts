'use server'
import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function saveSettings(formData: FormData) {
  const businessId = process.env.DEV_BUSINESS_ID
  if (!businessId) return

  await db.businessSettings.update({
    where: { businessId },
    data: {
      notifyPhone: (formData.get('notifyPhone') as string) || null,
      notifyEmail: (formData.get('notifyEmail') as string) || null,
      greetingMessage: formData.get('greetingMessage') as string,
    },
  })

  revalidatePath('/dashboard/settings')
}
