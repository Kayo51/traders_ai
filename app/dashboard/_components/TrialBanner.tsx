'use client'

import Link from 'next/link'

export function TrialBanner({ trialEndsAt }: { trialEndsAt: Date }) {
  const msLeft = trialEndsAt.getTime() - Date.now()
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))

  const urgent = daysLeft <= 3

  return (
    <div className={`flex items-center justify-between gap-4 px-5 py-2.5 text-sm ${
      urgent
        ? 'bg-red-500/10 border-b border-red-500/20 text-red-300'
        : 'bg-amber-500/10 border-b border-amber-500/20 text-amber-300'
    }`}>
      <p>
        {daysLeft === 0
          ? 'Your free trial expires today.'
          : daysLeft === 1
          ? '1 day left on your free trial.'
          : `${daysLeft} days left on your free trial.`}
        {' '}Your AI receptionist will stop answering calls when it ends.
      </p>
      <Link
        href="/onboarding/payment"
        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
          urgent
            ? 'bg-red-500 text-white hover:bg-red-400'
            : 'bg-amber-500 text-zinc-900 hover:bg-amber-400'
        }`}
      >
        Subscribe now →
      </Link>
    </div>
  )
}
