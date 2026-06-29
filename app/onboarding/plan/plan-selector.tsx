'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { selectPlan } from '../actions'

type Plan = 'ESSENTIAL' | 'PROFESSIONAL'

type Feature = { text: string; included: boolean }

const ESSENTIAL_FEATURES: Feature[] = [
  { text: '150 AI call minutes / month', included: true },
  { text: '1 AI Receptionist', included: true },
  { text: '1 Business Number', included: true },
  { text: 'SMS notifications', included: true },
  { text: 'Email notifications', included: true },
  { text: 'Basic dashboard & analytics', included: true },
  { text: 'Email support', included: true },
  { text: 'Receptionist customisation', included: false },
  { text: 'Voice & accent selection', included: false },
  { text: 'Custom greeting', included: false },
  { text: 'Call recording', included: false },
]

const PROFESSIONAL_FEATURES: Feature[] = [
  { text: '300 AI call minutes / month', included: true },
  { text: '1 AI Business Number', included: true },
  { text: 'Extra minutes at £0.20 / min', included: true },
  { text: 'Custom receptionist name', included: true },
  { text: 'Male or female receptionist', included: true },
  { text: 'British, American or Australian accent', included: true },
  { text: 'Custom greeting message', included: true },
  { text: 'Opening hours configuration', included: true },
  { text: 'Emergency call questions', included: true },
  { text: 'Call recording', included: true },
  { text: 'Advanced analytics dashboard', included: true },
  { text: 'Priority support', included: true },
]

function Check() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
  const [isPending, startTransition] = useTransition()

  const handleSelect = (plan: Plan) => {
    setSelected(plan)
    startTransition(async () => {
      await selectPlan(plan)
    })
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="grid gap-5 sm:grid-cols-2 items-start">

        {/* ── Essential ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="relative"
        >
          <button
            onClick={() => handleSelect('ESSENTIAL')}
            disabled={isPending}
            className={`group relative w-full rounded-2xl border bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
              selected === 'ESSENTIAL'
                ? 'border-blue-500/60'
                : 'border-white/[0.08] hover:border-white/20'
            }`}
          >
            {/* Header */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Ideal for sole traders</p>
              <h3 className="mt-1.5 text-2xl font-bold text-white">Essential</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">£99</span>
                <span className="text-sm text-zinc-500">/month</span>
              </div>
            </div>

            {/* Features */}
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

            {/* CTA */}
            <div className={`flex h-11 items-center justify-center rounded-xl font-semibold text-sm transition-all ${
              selected === 'ESSENTIAL'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-white/5 text-zinc-300 group-hover:bg-white/10'
            }`}>
              {isPending && selected === 'ESSENTIAL' ? <Spinner /> : 'Select Essential'}
            </div>
          </button>
        </motion.div>

        {/* ── Professional ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="relative"
        >
          {/* Badge */}
          <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
            <span className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white shadow-lg">
              ⭐ Most Popular
            </span>
          </div>

          <button
            onClick={() => handleSelect('PROFESSIONAL')}
            disabled={isPending}
            className={`group relative w-full rounded-2xl border bg-gradient-to-br from-violet-500/15 to-blue-500/10 p-8 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ring-1 ring-violet-500/20 shadow-[0_0_40px_rgba(139,92,246,0.12)] ${
              selected === 'PROFESSIONAL'
                ? 'border-violet-500'
                : 'border-violet-500/40 hover:border-violet-500/70'
            }`}
          >
            {/* Header */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
                Ideal for growing plumbing businesses
              </p>
              <h3 className="mt-1.5 text-2xl font-bold text-white">Professional</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">£149</span>
                <span className="text-sm text-zinc-500">/month</span>
              </div>
            </div>

            {/* Features */}
            <ul className="mb-6 space-y-2">
              {PROFESSIONAL_FEATURES.map(f => (
                <li key={f.text} className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-zinc-300">{f.text}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className={`flex h-11 items-center justify-center rounded-xl font-semibold text-sm transition-all ${
              selected === 'PROFESSIONAL'
                ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/30'
                : 'bg-violet-500/10 text-violet-200 group-hover:bg-violet-500/20'
            }`}>
              {isPending && selected === 'PROFESSIONAL' ? <Spinner /> : 'Select Professional'}
            </div>
          </button>
        </motion.div>

      </div>

      <p className="mt-8 text-center text-xs text-zinc-600">
        No credit card required · Cancel anytime · Upgrade or downgrade at any time
      </p>
    </div>
  )
}
