'use server'
import db from '@/lib/db'
import { getCurrentBusiness } from '@/lib/onboarding'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { LeadStatus } from '@prisma/client'

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

export async function deleteLead(leadId: string) {
  const business = await getCurrentBusiness()
  if (!business) return

  // businessId scoping prevents deleting another tenant's lead
  await db.lead.delete({
    where: { id: leadId, businessId: business.id },
  })

  redirect('/dashboard/leads')
}
