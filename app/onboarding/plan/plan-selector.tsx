'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { selectPlan } from '../actions'

type Plan = 'ESSENTIAL' | 'PROFESSIONAL'

type Feature = { text: string; included: boolean; highlight?: boolean }

const ESSENTIAL_FEATURES: Feature[] = [
  { text: 'AI voice receptionist 24/7', included: true },
  { text: 'Instant SMS & email lead alerts', included: true },
  { text: 'Tap-to-call button in every alert', included: true },
  { text: 'Lead capture dashboard', included: true },
  { text: '150 call minutes / month', included: true },
  { text: '14-day free trial', included: true },
  { text: 'Quote chaser (auto follow-up)', included: false },
  { text: 'Google review automation', included: false },
  { text: '"On My Way" customer notifications', included: false },
  { text: 'Appointment booking & reminders', included: false },
]

const PROFESSIONAL_FEATURES: Feature[] = [
  { text: 'Everything in Essential', included: true },
  { text: 'Quote chaser — auto follow-up at day 3 & 7', included: true, highlight: true },
  { text: 'Google review automation after every job', included: true, highlight: true },
  { text: '"On My Way" customer notifications', included: true, highlight: true },
  { text: 'Google Calendar appointment booking', included: true },
  { text: '24h & 5h appointment reminders', included: true },
  { text: '300 call minutes/month', included: true },
  { text: 'Custom receptionist name & voice', included: true },
  { text: 'British, Irish, Scottish or American accent', included: true },
  { text: 'Priority support', included: true },
]

function Check({ violet }: { violet?: boolean }) {
  return (
    <svg className={`mt-0.5 h-4 w-4 shrink-0 ${violet ? 'text-violet-400' : 'text-blue-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
  const [selected, setSelected] = useState<Plan | null>(null)
  const [trialMode, setTrialMode] = useState<boolean | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSelect = (plan: Plan, trial: boolean) => {
    setSelected(plan)
    setTrialMode(trial)
    startTransition(async () => {
      await selectPlan(plan, trial)
    })
  }

  return (
    <div className="w-full max-w-3xl">

      {/* Anchor line */}
      <p className="mb-8 text-center text-sm text-zinc-500">
        A part-time receptionist costs{' '}
        <span className="line-through text-zinc-600">£800+/month</span>
        {' '}— and still misses calls.
      </p>

      <div className="grid gap-5 sm:grid-cols-2 items-start">

        {/* ── Essential ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          <div className={`relative w-full rounded-2xl border bg-gradient-to-br from-blue-500/8 to-blue-600/4 p-6 text-left transition-all duration-200 ${
            selected === 'ESSENTIAL' ? 'border-blue-500/60' : 'border-white/[0.08]'
          }`}>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">For sole traders</p>
              <h3 className="mt-1.5 text-2xl font-bold text-white">Essential</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">£99</span>
                <span className="text-sm text-zinc-500">/month</span>
              </div>
              <p className="mt-1 text-xs text-zinc-600">Never miss another call</p>
            </div>

            <ul className="mb-6 space-y-2">
              {ESSENTIAL_FEATURES.map(f => (
                <li key={f.text} className="flex items-start gap-2.5">
                  {f.included ? <Check /> : <Cross />}
                  <span className={`text-sm ${f.included ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelect('ESSENTIAL', true)}
              disabled={isPending}
              className="w-full flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 font-semibold text-sm text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending && selected === 'ESSENTIAL' && trialMode === true ? <Spinner /> : 'Start 14-day free trial'}
            </button>
            <button
              onClick={() => handleSelect('ESSENTIAL', false)}
              disabled={isPending}
              className="mt-2 w-full flex h-9 items-center justify-center rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending && selected === 'ESSENTIAL' && trialMode === false ? <Spinner /> : 'Pay monthly — no trial →'}
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
              ⭐ Best Value
            </span>
          </div>

          <div className={`relative w-full rounded-2xl border bg-gradient-to-br from-violet-500/15 to-blue-500/8 p-8 text-left transition-all duration-200 ring-1 ring-violet-500/20 shadow-[0_0_50px_rgba(139,92,246,0.15)] ${
            selected === 'PROFESSIONAL' ? 'border-violet-500' : 'border-violet-500/40'
          }`}>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">For growing businesses</p>
              <h3 className="mt-1.5 text-2xl font-bold text-white">Professional</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">£149</span>
                <span className="text-sm text-zinc-500">/month</span>
              </div>
              <p className="mt-1 text-xs text-zinc-600">£4.97/day — less than a takeaway coffee</p>
              {/* ROI callout */}
              <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                <p className="text-xs text-emerald-400 font-medium">💰 One recovered quote pays for 2 months</p>
              </div>
            </div>

            <ul className="mb-6 space-y-2">
              {PROFESSIONAL_FEATURES.map(f => (
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
              {isPending && selected === 'PROFESSIONAL' && trialMode === true ? <Spinner /> : 'Start 14-day free trial'}
            </button>
            <button
              onClick={() => handleSelect('PROFESSIONAL', false)}
              disabled={isPending}
              className="mt-2 w-full flex h-9 items-center justify-center rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending && selected === 'PROFESSIONAL' && trialMode === false ? <Spinner /> : 'Pay monthly — no trial →'}
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
