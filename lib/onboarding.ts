import { cache } from 'react'
import { auth, currentUser } from '@clerk/nextjs/server'
import db from '@/lib/db'
import { generateSimulatedNumber, formatPhoneNumber } from '@/lib/phone-utils'

export { generateSimulatedNumber, formatPhoneNumber }

export const getCurrentBusiness = cache(async () => {
  const { userId } = await auth()
  if (!userId) return null

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      memberships: {
        where: { role: 'OWNER' },
        include: { business: { include: { settings: true } } },
        take: 1,
      },
    },
  })

  return user?.memberships[0]?.business ?? null
})

export async function ensureUserAndBusiness(plan: 'STARTER' | 'ESSENTIAL' | 'PROFESSIONAL' | 'ENTERPRISE') {
  const clerkUser = await currentUser()
  if (!clerkUser) throw new Error('Not authenticated')

  const email = clerkUser.primaryEmailAddress?.emailAddress ?? ''

  const user = await db.user.upsert({
    where: { clerkUserId: clerkUser.id },
    update: { firstName: clerkUser.firstName, lastName: clerkUser.lastName, avatarUrl: clerkUser.imageUrl },
    create: {
      clerkUserId: clerkUser.id,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      avatarUrl: clerkUser.imageUrl,
    },
  })

  const existing = await db.businessMember.findFirst({
    where: { userId: user.id, role: 'OWNER' },
    include: { business: true },
  })

  if (existing) {
    return db.business.update({
      where: { id: existing.businessId },
      data: { subscriptionPlan: plan },
    })
  }

  const slug = `biz-${clerkUser.id.slice(-12).toLowerCase().replace(/[^a-z0-9]/g, '')}`

  return db.business.create({
    data: {
      name: 'My Business',
      slug,
      ownerEmail: email,
      subscriptionPlan: plan,
      members: { create: { userId: user.id, role: 'OWNER' } },
      settings: { create: {} },
    },
  })
}

