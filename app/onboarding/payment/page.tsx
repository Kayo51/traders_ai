import { redirect } from 'next/navigation'
import { getCurrentBusiness } from '@/lib/onboarding'
import StepProgress from '@/components/onboarding/step-progress'

export const dynamic = 'force-dynamic'

const PLAN_DETAILS: Record<string, { label: string; price: string; period: string; color: string }> = {
  ESSENTIAL: {
    label: 'Essential',
    price: '£99',
    period: '/month',
    color: 'from-blue-500/15 to-blue-600/5 border-blue-500/30',
  },
  PROFESSIONAL: {
    label: 'Professional',
    price: '£149',
    period: '/month',
    color: 'from-violet-500/15 to-blue-500/10 border-violet-500/40',
  },
}

export default async function PaymentPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const business = await getCurrentBusiness()
  if (!business) redirect('/onboarding/plan')
  if (!business.receptionistName) redirect('/onboarding/setup')
  if (business.onboardingCompleted) redirect('/dashboard/leads')

  const { error } = await searchParams
  const plan = PLAN_DETAILS[business.subscriptionPlan ?? ''] ?? PLAN_DETAILS.ESSENTIAL

  return (
    <div className="flex flex-col items-center px-6 py-12">
      <StepProgress current="payment" />

      <div className="mt-12 mb-8 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Complete your subscription</h1>
        <p className="mt-3 text-zinc-400">
          You're one step away. Secure checkout via Stripe.
        </p>
      </div>

      <div className="w-full max-w-md">
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Payment failed or was cancelled — please try again.
          </div>
        )}

        {/* Plan summary */}
        <div className={`rounded-2xl border bg-gradient-to-br ${plan.color} p-6 mb-5`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Your plan</p>
              <h2 className="mt-1 text-xl font-bold text-white">{plan.label}</h2>
              <p className="mt-0.5 text-sm text-zinc-400">{business.name}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-white">{plan.price}</span>
              <span className="text-sm text-zinc-500">{plan.period}</span>
            </div>
          </div>

          <div className="mt-5 border-t border-white/[0.07] pt-4 grid grid-cols-2 gap-2">
            {[
              { icon: '🤖', text: `${business.receptionistName ?? 'AI'} — your receptionist` },
              { icon: '📞', text: 'Your dedicated number' },
              { icon: '📲', text: 'Instant SMS & email alerts' },
              { icon: '🔄', text: 'Auto follow-up messages' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout form */}
        <form method="POST" action="/api/stripe/checkout-onboarding">
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pay securely with Stripe →
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-600">
          Cancel anytime · No contracts · 256-bit SSL encryption
        </p>
      </div>
    </div>
  )
}
