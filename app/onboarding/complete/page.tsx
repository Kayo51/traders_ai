import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentBusiness } from '@/lib/onboarding'
import { formatPhoneNumber } from '@/lib/onboarding'
import CompleteAnimation from './complete-animation'

const PLAN_LABELS: Record<string, string> = {
  ESSENTIAL: 'Essential — £99/month',
  PROFESSIONAL: 'Professional — £149/month',
  STARTER: 'Starter — £99/month',
  ENTERPRISE: 'Enterprise — £199/month',
}

const VOICE_LABELS: Record<string, string> = {
  EMMA: 'Emma',
  SARAH: 'Sarah',
  JAMES: 'James',
  OLIVER: 'Oliver',
}

const ACCENT_LABELS: Record<string, string> = {
  BRITISH: 'British',
  AMERICAN: 'American',
  AUSTRALIAN: 'Australian',
  IRISH: 'Irish',
  SCOTTISH: 'Scottish',
}

export default async function CompletePage() {
  const business = await getCurrentBusiness()

  if (!business) redirect('/onboarding/plan')
  if (!business.onboardingCompleted) redirect('/onboarding/setup')

  const phone = business.twilioPhoneNumber
    ? formatPhoneNumber(business.twilioPhoneNumber)
    : '—'

  const summaryItems = [
    { label: 'Business', value: business.name },
    { label: 'Your Number', value: phone },
    { label: 'Receptionist', value: business.receptionistName ?? '—' },
    {
      label: 'Voice',
      value: business.receptionistVoice
        ? `${VOICE_LABELS[business.receptionistVoice]} · ${ACCENT_LABELS[business.receptionistAccent ?? 'BRITISH']}`
        : '—',
    },
    { label: 'Plan', value: PLAN_LABELS[business.subscriptionPlan ?? ''] ?? '—' },
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
            href="/dashboard"
            className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30"
          >
            Go To Dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
