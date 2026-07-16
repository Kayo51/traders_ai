'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { selectPlan } from '../actions'

type Plan = 'ESSENTIAL' | 'PROFESSIONAL' | 'ENTERPRISE'
type Billing = 'MONTHLY' | 'ANNUAL'

type Feature = { text: string; highlight?: boolean }

const STARTER_FEATURES: Feature[] = [
  { text: 'AI voice receptionist 24/7' },
  { text: 'Instant SMS & email lead alerts' },
  { text: 'Tap-to-call button in every alert' },
  { text: 'Lead capture dashboard' },
  { text: '150 call minutes / month' },
  { text: '14-day free trial' },
]
const STARTER_LOCKED = [
  'Quote chaser (auto follow-up)',
  'Google review automation',
  '"On My Way" notifications',
  'Appointment booking & reminders',
  'Custom receptionist voice',
]

const PRO_FEATURES: Feature[] = [
  { text: 'Everything in Starter' },
  { text: 'Quote chaser — day 3 & day 7 auto follow-up', highlight: true },
  { text: 'Google review automation after every job', highlight: true },
  { text: '"On My Way" customer notifications', highlight: true },
  { text: 'Google Calendar appointment booking' },
  { text: '24h & 5h appointment reminders' },
  { text: '300 call minutes / month' },
  { text: 'Custom receptionist name & voice' },
  { text: 'Priority support' },
]

const BUSINESS_FEATURES: Feature[] = [
  { text: 'Everything in Professional' },
  { text: 'Unlimited call minutes', highlight: true },
  { text: 'Multiple notification contacts', highlight: true },
  { text: 'Custom AI persona name & voice' },
  { text: 'Priority phone support' },
  { text: 'Dedicated onboarding call' },
]

const MONTHLY = { ESSENTIAL: 99, PROFESSIONAL: 179, ENTERPRISE: 279 }
const ANNUAL  = { ESSENTIAL: 82, PROFESSIONAL: 149, ENTERPRISE: 232 }

function Check({ violet, amber }: { violet?: boolean; amber?: boolean }) {
  const colour = amber ? 'text-amber-400' : violet ? 'text-violet-400' : 'text-blue-400'
  return (
    <svg className={`mt-0.5 h-4 w-4 shrink-0 ${colour}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function Cross() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default function PlanSelector() {
  const [billing, setBilling] = useState<Billing>('MONTHLY')
  const [selected, setSelected] = useState<Plan | null>(null)
  const [trialMode, setTrialMode] = useState<boolean | null>(null)
  const [isPending, startTransition] = useTransition()

  const prices = billing === 'ANNUAL' ? ANNUAL : MONTHLY

  const handleSelect = (plan: Plan, trial: boolean) => {
    setSelected(plan)
    setTrialMode(trial)
    startTransition(async () => {
      await selectPlan(plan, trial, billing)
    })
  }

  const isLoading = (plan: Plan, trial: boolean) =>
    isPending && selected === plan && trialMode === trial

  return (
    <div className="w-full max-w-5xl">

      {/* Value anchor */}
      <p className="mb-6 text-center text-sm text-zinc-500">
        A missed call costs a plumber <span className="text-white font-semibold">£200–£500</span> in lost work.
        TradeSpeak catches every single one.
      </p>

      {/* Billing toggle */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <button
          onClick={() => setBilling('MONTHLY')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            billing === 'MONTHLY'
              ? 'bg-white text-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling('ANNUAL')}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            billing === 'ANNUAL'
              ? 'bg-white text-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Annual
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
            2 MONTHS FREE
          </span>
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3 items-start">

        {/* ── Starter ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          <div className={`relative w-full rounded-2xl border bg-gradient-to-br from-blue-500/8 to-blue-600/4 p-6 text-left transition-all duration-200 ${
            selected === 'ESSENTIAL' ? 'border-blue-500/60' : 'border-white/[0.08]'
          }`}>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Starter</p>
              <h3 className="mt-1.5 text-2xl font-bold text-white">
                £{prices.ESSENTIAL}
                <span className="text-sm font-normal text-zinc-500"> /mo</span>
              </h3>
              {billing === 'ANNUAL' && (
                <p className="mt-1 text-xs text-emerald-400">£{prices.ESSENTIAL * 12}/yr — saves £{(MONTHLY.ESSENTIAL - ANNUAL.ESSENTIAL) * 12}</p>
              )}
              <p className="mt-1 text-xs text-zinc-600">£{(prices.ESSENTIAL / 30).toFixed(2)}/day — never miss another call</p>
            </div>

            <ul className="mb-5 space-y-2">
              {STARTER_FEATURES.map(f => (
                <li key={f.text} className="flex items-start gap-2.5">
                  <Check />
                  <span className="text-sm text-zinc-300">{f.text}</span>
                </li>
              ))}
              {STARTER_LOCKED.map(f => (
                <li key={f} className="flex items-start gap-2.5">
                  <Cross />
                  <span className="text-sm text-zinc-600">{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelect('ESSENTIAL', true)}
              disabled={isPending}
              className="w-full flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 font-semibold text-sm text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading('ESSENTIAL', true) ? <Spinner /> : 'Start 14-day free trial'}
            </button>
            <button
              onClick={() => handleSelect('ESSENTIAL', false)}
              disabled={isPending}
              className="mt-2 w-full flex h-9 items-center justify-center rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading('ESSENTIAL', false) ? <Spinner /> : 'Pay now — no trial →'}
            </button>
          </div>
        </motion.div>

        {/* ── Professional ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="relative"
        >
          <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2">
            <span className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-500/30">
              ⭐ Most Popular
            </span>
          </div>

          <div className={`relative w-full rounded-2xl border bg-gradient-to-br from-violet-500/15 to-blue-500/8 p-6 text-left transition-all duration-200 ring-1 ring-violet-500/20 shadow-[0_0_50px_rgba(139,92,246,0.15)] ${
            selected === 'PROFESSIONAL' ? 'border-violet-500' : 'border-violet-500/40'
          }`}>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Professional</p>
              <h3 className="mt-1.5 text-2xl font-bold text-white">
                £{prices.PROFESSIONAL}
                <span className="text-sm font-normal text-zinc-500"> /mo</span>
              </h3>
              {billing === 'ANNUAL' && (
                <p className="mt-1 text-xs text-emerald-400">£{prices.PROFESSIONAL * 12}/yr — saves £{(MONTHLY.PROFESSIONAL - ANNUAL.PROFESSIONAL) * 12}</p>
              )}
              <p className="mt-1 text-xs text-zinc-500">£{(prices.PROFESSIONAL / 30).toFixed(2)}/day</p>
              <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                <p className="text-xs text-emerald-400 font-medium">One recovered quote pays for 2+ months</p>
              </div>
            </div>

            <ul className="mb-5 space-y-2">
              {PRO_FEATURES.map(f => (
                <li key={f.text} className="flex items-start gap-2.5">
                  <Check violet={f.highlight} />
                  <span className={`text-sm ${f.highlight ? 'text-white font-medium' : 'text-zinc-300'}`}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelect('PROFESSIONAL', true)}
              disabled={isPending}
              className="w-full flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 font-semibold text-sm text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading('PROFESSIONAL', true) ? <Spinner /> : 'Start 14-day free trial'}
            </button>
            <button
              onClick={() => handleSelect('PROFESSIONAL', false)}
              disabled={isPending}
              className="mt-2 w-full flex h-9 items-center justify-center rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading('PROFESSIONAL', false) ? <Spinner /> : 'Pay now — no trial →'}
            </button>
          </div>
        </motion.div>

        {/* ── Business ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="relative"
        >
          <div className={`relative w-full rounded-2xl border bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 text-left transition-all duration-200 ${
            selected === 'ENTERPRISE' ? 'border-amber-500/60' : 'border-amber-500/20'
          }`}>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-500/80">Business</p>
              <h3 className="mt-1.5 text-2xl font-bold text-white">
                £{prices.ENTERPRISE}
                <span className="text-sm font-normal text-zinc-500"> /mo</span>
              </h3>
              {billing === 'ANNUAL' && (
                <p className="mt-1 text-xs text-emerald-400">£{prices.ENTERPRISE * 12}/yr — saves £{(MONTHLY.ENTERPRISE - ANNUAL.ENTERPRISE) * 12}</p>
              )}
              <p className="mt-1 text-xs text-zinc-600">£{(prices.ENTERPRISE / 30).toFixed(2)}/day</p>
              <p className="mt-1 text-xs text-zinc-500">For established trade businesses with high call volumes</p>
            </div>

            <ul className="mb-5 space-y-2">
              {BUSINESS_FEATURES.map(f => (
                <li key={f.text} className="flex items-start gap-2.5">
                  <Check amber={f.highlight} />
                  <span className={`text-sm ${f.highlight ? 'text-white font-medium' : 'text-zinc-300'}`}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelect('ENTERPRISE', true)}
              disabled={isPending}
              className="w-full flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-sm text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading('ENTERPRISE', true) ? <Spinner /> : 'Start 14-day free trial'}
            </button>
            <button
              onClick={() => handleSelect('ENTERPRISE', false)}
              disabled={isPending}
              className="mt-2 w-full flex h-9 items-center justify-center rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading('ENTERPRISE', false) ? <Spinner /> : 'Pay now — no trial →'}
            </button>
          </div>
        </motion.div>

      </div>

      <p className="mt-8 text-center text-xs text-zinc-600">
        14-day free trial · No credit card required · Cancel anytime · No contracts
      </p>
    </div>
  )
}
