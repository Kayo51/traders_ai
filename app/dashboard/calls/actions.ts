'use server'
import { revalidatePath } from 'next/cache'
import db from '@/lib/db'
import { getCurrentBusiness } from '@/lib/onboarding'
import type { CallStatus } from '@prisma/client'

export async function updateCallStatus(callId: string, status: CallStatus) {
  const business = await getCurrentBusiness()
  if (!business) throw new Error('Not authenticated')
  await db.call.update({
    where: { id: callId, businessId: business.id },
    data: { status },
  })
  revalidatePath('/dashboard/calls')
}

export async function deleteCall(callId: string) {
  const business = await getCurrentBusiness()
  if (!business) throw new Error('Not authenticated')
  await db.call.delete({ where: { id: callId, businessId: business.id } })
  revalidatePath('/dashboard/calls')
}
