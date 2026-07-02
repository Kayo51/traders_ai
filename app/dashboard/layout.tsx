import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getCurrentBusiness } from '@/lib/onboarding'
import db from '@/lib/db'
import Nav from './_components/nav'
import { DashboardShell } from './_components/DashboardShell'
import { TrialBanner } from './_components/TrialBanner'

async function getNewLeadCount(businessId: string): Promise<number> {
  const jar = await cookies()
  const raw = jar.get('lastLeadsViewedAt')?.value
  const since = raw ? new Date(raw) : new Date(Date.now() - 24 * 60 * 60 * 1000)
  return db.lead.count({ where: { businessId, createdAt: { gt: since } } })
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const business = await getCurrentBusiness()

  if (!business || !business.onboardingCompleted) {
    redirect('/onboarding')
  }

  const hasSubscription = !!business.stripeSubscriptionId
  const trialEndsAt = business.trialEndsAt
  const trialActive = trialEndsAt && trialEndsAt > new Date()

  // Trial expired and no paid subscription — send to payment
  if (!hasSubscription && !trialActive) {
    redirect('/onboarding/payment')
  }

  const newLeadCount = await getNewLeadCount(business.id)

  const sidebar = (
    <>
      <div className="flex h-14 items-center px-5 border-b border-zinc-800">
        <a href="/" className="text-sm font-semibold tracking-tight text-white hover:text-zinc-300 transition-colors">
          TradeFlow AI
        </a>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Nav newLeadCount={newLeadCount} />
      </div>
    </>
  )

  return (
    <DashboardShell sidebar={sidebar}>
      {!hasSubscription && trialActive && trialEndsAt && (
        <TrialBanner trialEndsAt={trialEndsAt} />
      )}
      {children}
    </DashboardShell>
  )
}
