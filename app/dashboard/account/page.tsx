import { getCurrentBusiness } from '@/lib/onboarding'
import db from '@/lib/db'

const PLAN_META: Record<string, {
  label: string
  price: string
  color: string
  features: string[]
}> = {
  STARTER: {
    label: 'Starter',
    price: 'Free trial',
    color: 'text-zinc-500 bg-zinc-100 ring-zinc-200',
    features: [
      'Basic AI receptionist',
      'Call summaries',
      'Email notifications',
      'Dashboard access',
    ],
  },
  ESSENTIAL: {
    label: 'Essential',
    price: '£99 / month',
    color: 'text-blue-700 bg-blue-50 ring-blue-200',
    features: [
      '150 AI call minutes / month',
      '1 AI Receptionist',
      '1 Business Number',
      'SMS & email notifications',
      'Basic dashboard & analytics',
      'Email support',
    ],
  },
  PROFESSIONAL: {
    label: 'Professional',
    price: '£179 / month',
    color: 'text-violet-700 bg-violet-50 ring-violet-200',
    features: [
      '300 AI call minutes / month',
      'Extra minutes at £0.20 / min',
      'Custom receptionist name & voice',
      'British, American or Australian accent',
      'Custom greeting message',
      'Opening hours configuration',
      'Emergency call questions',
      'Call recording',
      'Advanced analytics dashboard',
      'Appointment booking',
      'Priority support',
    ],
  },
  ENTERPRISE: {
    label: 'Enterprise',
    price: 'Custom pricing',
    color: 'text-amber-700 bg-amber-50 ring-amber-200',
    features: [
      'Unlimited AI call minutes',
      'Multiple business numbers',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'White-label options',
    ],
  },
}

const UPGRADE_OPTIONS = [
  {
    key: 'ESSENTIAL',
    label: 'Essential',
    price: '£99',
    period: '/mo',
    highlight: false,
    cta: 'Upgrade to Essential',
  },
  {
    key: 'PROFESSIONAL',
    label: 'Professional',
    price: '£179',
    period: '/mo',
    highlight: true,
    cta: 'Upgrade to Professional',
  },
  {
    key: 'ENTERPRISE',
    label: 'Business',
    price: '£279',
    period: '',
    highlight: false,
    cta: 'Contact sales',
  },
]

const stripeEnabled = !!(
  process.env.STRIPE_PRICE_ESSENTIAL &&
  process.env.STRIPE_PRICE_PROFESSIONAL &&
  process.env.STRIPE_SECRET_KEY
)

function Check() {
  return (
    <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const business = await getCurrentBusiness()

  // Reload from DB to get Stripe fields (getCurrentBusiness may be cached)
  const biz = business
    ? await db.business.findUnique({ where: { id: business.id } })
    : null

  let planKey: string = 'STARTER'
  if (biz?.subscriptionPlan) {
    planKey = biz.subscriptionPlan
  } else if (biz?.plan && (biz.plan as string) !== 'FREE') {
    planKey = biz.plan
  }

  const meta = PLAN_META[planKey] ?? PLAN_META.STARTER
  const isOnPaidPlan = planKey !== 'STARTER' && planKey !== 'FREE'
  const hasStripeCustomer = !!biz?.stripeCustomerId

  const trialEndsAt = biz?.trialEndsAt
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86_400_000))
    : null

  const upgradePlans = UPGRADE_OPTIONS.filter(o => o.key !== planKey && o.key !== 'ENTERPRISE')
  const showSuccess = params.success === 'true'
  const showError   = !!params.error

  return (
    <div className="flex flex-col gap-8 p-8 max-w-3xl">

      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Account</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage your plan and subscription.</p>
      </div>

      {/* Success / error banners */}
      {showSuccess && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <svg className="h-5 w-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-emerald-800 font-medium">Subscription activated — welcome to your new plan!</p>
        </div>
      )}
      {showError && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <svg className="h-5 w-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-800 font-medium">Something went wrong. Please try again or contact support.</p>
        </div>
      )}

      {/* Current plan */}
      <section className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
        <div className="px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Current plan</h2>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${meta.color}`}>
            {meta.label}
          </span>
        </div>

        {trialDaysLeft !== null && (
          <div className="px-5 py-3 bg-amber-50 text-xs text-amber-700 flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {trialDaysLeft > 0
              ? `Trial ends in ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} — upgrade to keep uninterrupted access.`
              : 'Your trial has ended. Upgrade to restore access.'}
          </div>
        )}

        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-zinc-700">Billing</span>
          <span className="text-sm font-medium text-zinc-900">{meta.price}</span>
        </div>

        <div className="px-5 py-4">
          <p className="mb-3 text-xs font-medium text-zinc-500">Included features</p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {meta.features.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-zinc-700">
                <Check />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {isOnPaidPlan && (
          <div className="px-5 py-4 flex gap-3">
            {hasStripeCustomer && stripeEnabled ? (
              <form action="/api/stripe/portal" method="POST">
                <button
                  type="submit"
                  className="rounded-lg border border-zinc-200 px-4 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Manage subscription
                </button>
              </form>
            ) : (
              <a
                href="mailto:hello@tradespeakai.co.uk?subject=Subscription%20change%20request"
                className="rounded-lg border border-zinc-200 px-4 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Change plan
              </a>
            )}
            {hasStripeCustomer && stripeEnabled ? (
              <form action="/api/stripe/portal" method="POST">
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 px-4 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Cancel subscription
                </button>
              </form>
            ) : (
              <a
                href="mailto:hello@tradespeakai.co.uk?subject=Cancel%20subscription"
                className="rounded-lg border border-red-200 px-4 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Cancel subscription
              </a>
            )}
          </div>
        )}
      </section>

      {/* Upgrade options */}
      {upgradePlans.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">Upgrade your plan</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {upgradePlans.map(plan => (
              <div
                key={plan.key}
                className={`relative rounded-xl border bg-white p-5 flex flex-col gap-4 ${
                  plan.highlight ? 'border-violet-300 shadow-sm shadow-violet-100' : 'border-zinc-200'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-0.5 text-[11px] font-semibold text-white shadow">
                    Most popular
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{plan.label}</p>
                  <p className="mt-0.5">
                    <span className="text-xl font-bold text-zinc-900">{plan.price}</span>
                    {plan.period && <span className="text-xs text-zinc-500">{plan.period}</span>}
                  </p>
                </div>
                <ul className="flex-1 space-y-1.5">
                  {(PLAN_META[plan.key]?.features ?? []).slice(0, 5).map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-zinc-600">
                      <Check />
                      {f}
                    </li>
                  ))}
                  {(PLAN_META[plan.key]?.features.length ?? 0) > 5 && (
                    <li className="text-xs text-zinc-400 pl-5">
                      +{(PLAN_META[plan.key]?.features.length ?? 0) - 5} more
                    </li>
                  )}
                </ul>

                {stripeEnabled ? (
                  <form action="/api/stripe/checkout" method="POST">
                    <input type="hidden" name="planKey" value={plan.key} />
                    <button
                      type="submit"
                      className={`w-full rounded-lg px-4 py-2 text-center text-xs font-semibold transition-colors ${
                        plan.highlight
                          ? 'bg-violet-600 text-white hover:bg-violet-700'
                          : 'bg-zinc-900 text-white hover:bg-zinc-700'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </form>
                ) : (
                  <a
                    href={`mailto:hello@tradespeakai.co.uk?subject=Upgrade%20to%20${plan.label}`}
                    className={`block rounded-lg px-4 py-2 text-center text-xs font-semibold transition-colors ${
                      plan.highlight
                        ? 'bg-violet-600 text-white hover:bg-violet-700'
                        : 'bg-zinc-900 text-white hover:bg-zinc-700'
                    }`}
                  >
                    {plan.cta}
                  </a>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            Need Enterprise or a custom plan?{' '}
            <a href="mailto:hello@tradespeakai.co.uk?subject=Enterprise%20plan%20enquiry" className="underline hover:text-zinc-700">
              Contact us
            </a>
          </p>
        </section>
      )}

      {/* Business info */}
      <section className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-900">Business details</h2>
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-xs text-zinc-500">Business name</span>
          <span className="text-sm text-zinc-900">{biz?.name ?? '—'}</span>
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-xs text-zinc-500">Phone number</span>
          <span className="text-sm text-zinc-900 font-mono">{biz?.twilioPhoneNumber ?? '—'}</span>
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-xs text-zinc-500">Owner email</span>
          <span className="text-sm text-zinc-900">{biz?.ownerEmail ?? '—'}</span>
        </div>
      </section>
    </div>
  )
}
