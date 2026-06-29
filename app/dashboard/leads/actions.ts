'use server'
import { revalidatePath } from 'next/cache'
import db from '@/lib/db'
import { getCurrentBusiness } from '@/lib/onboarding'
import { calcNextFollowUpAt } from '@/lib/follow-up-scheduler'

export async function markAsContacted(leadId: string) {
  const business = await getCurrentBusiness()
  if (!business) throw new Error('Not authenticated')

  await db.lead.update({
    where: { id: leadId, businessId: business.id },
    data: {
      contacted: true,
      contactedAt: new Date(),
      status: 'CONTACTED',
      followUpStopped: true,
      nextFollowUpAt: null,
    },
  })

  revalidatePath('/dashboard/leads')
}

export async function undoContacted(leadId: string) {
  const business = await getCurrentBusiness()
  if (!business) throw new Error('Not authenticated')

  const lead = await db.lead.findFirst({
    where: { id: leadId, businessId: business.id },
    include: { business: { include: { settings: true } } },
  })
  if (!lead) throw new Error('Lead not found')

  const settings = lead.business.settings
  const nextFollowUpAt = settings ? calcNextFollowUpAt(lead as any, settings as any) : null

  await db.lead.update({
    where: { id: leadId },
    data: {
      contacted: false,
      contactedAt: null,
      status: 'NEW',
      followUpStopped: !nextFollowUpAt,
      nextFollowUpAt,
    },
  })

  revalidatePath('/dashboard/leads')
}
