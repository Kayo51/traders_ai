import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentBusiness, formatPhoneNumber } from '@/lib/onboarding'
import { stripe } from '@/lib/stripe'
import db from '@/lib/db'
import { generateAndCacheGreeting } from '@/lib/greeting-cache'
import CompleteAnimation from './complete-animation'

export const dynamic = 'force-dynamic'

const PLAN_LABELS: Record<string, string> = {
  ESSENTIAL: 'Essential — £99/month',
  PROFESSIONAL: 'Professional — £149/month',
  STARTER: 'Starter — £99/month',
  ENTERPRISE: 'Enterprise — £199/month',
}

const VOICE_LABELS: Record<string, string> = {
  EMMA: 'Emma', SARAH: 'Sarah', JAMES: 'James', OLIVER: 'Oliver',
}

const ACCENT_LABELS: Record<string, string> = {
  BRITISH: 'British', AMERICAN: 'American', AUSTRALIAN: 'Australian',
  IRISH: 'Irish', SCOTTISH: 'Scottish',
}

export default async function CompletePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  // Try to get the business from the authenticated session
  let business = await getCurrentBusiness()

  // If auth session was lost on return from Stripe (common in dev/ngrok),
  // find the business directly via the Stripe session metadata.
  // NOTE: redirect() throws internally in Next.js — must be called OUTSIDE try/catch.
  if (!business && session_id) {
    let postPaymentRedirect: string | null = null
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(session_id)

      if (
        stripeSession.payment_status === 'paid' &&
        stripeSession.customer &&
        stripeSession.subscription
      ) {
        const businessId =
          stripeSession.client_reference_id ?? (stripeSession.metadata?.businessId as string | undefined)

        if (businessId) {
          await db.business.update({
            where: { id: businessId },
            data: {
              stripeCustomerId: stripeSession.customer as string,
              stripeSubscriptionId: stripeSession.subscription as string,
              onboardingCompleted: true,
            },
          })
          generateAndCacheGreeting(businessId).catch(err =>
            console.error('[complete] greeting cache failed:', err)
          )
          postPaymentRedirect = '/sign-in?redirect_url=/dashboard/leads'
        }
      }
    } catch (err) {
      console.error('[onboarding/complete] Stripe session lookup failed:', err)
    }

    redirect(postPaymentRedirect ?? '/onboarding/payment?error=1')
  }

  if (!business) redirect('/onboarding/plan')

  // Trial user completing onboarding without Stripe payment
  if (!business.onboardingCompleted && !session_id && business.trialEndsAt) {
    await db.business.update({
      where: { id: business.id },
      data: { onboardingCompleted: true },
    })
    generateAndCacheGreeting(business.id).catch(err =>
      console.error('[complete] greeting cache failed:', err)
    )
  }

  // Normal authenticated flow — verify payment if returning from Stripe checkout
  if (session_id && !business.onboardingCompleted) {
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(session_id)

      if (stripeSession.payment_status === 'paid' && stripeSession.customer && stripeSession.subscription) {
        await db.business.update({
          where: { id: business.id },
          data: {
            stripeCustomerId: stripeSession.customer as string,
            stripeSubscriptionId: stripeSession.subscription as string,
            onboardingCompleted: true,
          },
        })
        generateAndCacheGreeting(business.id).catch(err =>
          console.error('[complete] greeting cache failed:', err)
        )
      } else {
        redirect('/onboarding/payment?error=1')
      }
    } catch (err) {
      console.error('[onboarding/complete] Stripe verify failed:', err)
      redirect('/onboarding/payment?error=1')
    }
  }

  // Re-fetch fresh state
  const fresh = await db.business.findUnique({
    where: { id: business.id },
    include: { settings: true },
  })

  if (!fresh?.onboardingCompleted) redirect('/onboarding/payment')

  const phone = fresh.twilioPhoneNumber ? formatPhoneNumber(fresh.twilioPhoneNumber) : '—'

  const summaryItems = [
    { label: 'Business', value: fresh.name },
    { label: 'Your Number', value: phone },
    { label: 'Receptionist', value: fresh.receptionistName ?? '—' },
    {
      label: 'Voice',
      value: fresh.receptionistVoice
        ? `${VOICE_LABELS[fresh.receptionistVoice]} · ${ACCENT_LABELS[fresh.receptionistAccent ?? 'BRITISH']}`
        : '—',
    },
    { label: 'Plan', value: PLAN_LABELS[fresh.subscriptionPlan ?? ''] ?? '—' },
  ]

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <CompleteAnimation />

        <div className="mt-8 rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-6 backdrop-blur-xl">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500">Your configuration</h2>
          <dl className="space-y-3">
            {summaryItems.map(item => (
              <div key={item.label} className="flex items-start justify-between gap-4">
                <dt className="text-sm text-zinc-500">{item.label}</dt>
                <dd className="text-right text-sm font-medium text-white">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            href="/onboarding/test"
            className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/10"
          >
            Test My Receptionist
          </Link>
          <Link
            href="/dashboard/leads"
            className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30"
          >
            Go To Dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
