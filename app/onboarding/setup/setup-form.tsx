'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { saveSetup } from '../actions'

type Defaults = {
  businessName: string
  businessType: string
  businessPhone: string
  openingHoursText: string
  emergencyService: boolean
  receptionistName: string
  receptionistVoice: string
  receptionistGender: string
  receptionistAccent: string
  receptionistTone: string
  greetingMessage: string
}

type Props = {
  plan: string
  defaults: Defaults
}

const VOICE_GENDER: Record<string, string> = {
  EMMA: 'FEMALE',
  SARAH: 'FEMALE',
  JAMES: 'MALE',
  OLIVER: 'MALE',
}

const BUSINESS_TYPES = [
  { value: 'PLUMBER', label: 'Plumber' },
  { value: 'ELECTRICIAN', label: 'Electrician' },
  { value: 'HEATING_ENGINEER', label: 'Heating Engineer' },
  { value: 'BUILDER', label: 'Builder' },
  { value: 'LOCKSMITH', label: 'Locksmith' },
  { value: 'CLEANING_COMPANY', label: 'Cleaning Company' },
  { value: 'HVAC', label: 'HVAC' },
]

// Professional only: British, American, Australian (per spec)
const ACCENTS = [
  { value: 'BRITISH', label: 'British' },
  { value: 'AMERICAN', label: 'American' },
  { value: 'AUSTRALIAN', label: 'Australian' },
]

const TONES = [
  { value: 'FRIENDLY', label: 'Friendly' },
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'LUXURY', label: 'Luxury' },
  { value: 'CASUAL', label: 'Casual' },
]

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-300">
        {label}
        {hint && <span className="ml-1.5 text-xs font-normal text-zinc-600">({hint})</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-blue-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-blue-500/25'

const selectClass = inputClass + ' appearance-none cursor-pointer'

// Locked feature items shown on Essential plan
const LOCKED_FEATURES = [
  'Custom receptionist name',
  'Male or female voice selection',
  'British, American or Australian accent',
  'Custom greeting message',
  'Business personality & tone',
]

export default function SetupForm({ plan, defaults }: Props) {
  const isEssential = plan === 'ESSENTIAL'

  const [voice, setVoice] = useState(defaults.receptionistVoice)
  const [gender, setGender] = useState(defaults.receptionistGender)
  const [emergencyService, setEmergencyService] = useState(defaults.emergencyService)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setGender(VOICE_GENDER[voice] ?? 'FEMALE')
  }, [voice])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await saveSetup(formData)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">

      {/* ── Section 1: Business Details ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-6 backdrop-blur-xl"
      >
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">1</div>
            <h2 className="text-base font-semibold text-white">Business Details</h2>
          </div>
          <p className="ml-8 text-xs text-zinc-500">Tell us about your business so your AI can represent you accurately.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business Name">
            <input
              name="businessName"
              type="text"
              required
              defaultValue={defaults.businessName}
              placeholder="e.g. Smith Plumbing Ltd"
              className={inputClass}
            />
          </Field>

          <Field label="Business Type">
            <select name="businessType" required defaultValue={defaults.businessType} className={selectClass}>
              <option value="" disabled>Select type…</option>
              {BUSINESS_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Business Phone" hint="shown to customers">
            <input
              name="businessPhone"
              type="tel"
              defaultValue={defaults.businessPhone}
              placeholder="+44 7700 900000"
              className={inputClass}
            />
          </Field>

          {/* Opening hours: Professional only */}
          {!isEssential && (
            <Field label="Opening Hours">
              <input
                name="openingHoursText"
                type="text"
                defaultValue={defaults.openingHoursText}
                placeholder="Mon–Fri 8am–6pm, Sat 9am–2pm"
                className={inputClass}
              />
            </Field>
          )}

          {/* Emergency service: Professional only */}
          {!isEssential && (
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-300">Emergency service available?</p>
                  <p className="text-xs text-zinc-600">AI will tell callers you handle emergencies</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmergencyService(v => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emergencyService ? 'bg-blue-500' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${emergencyService ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <input type="hidden" name="emergencyService" value={emergencyService ? 'on' : 'off'} />
              </div>
            </div>
          )}

          {/* Hidden fields for Essential so form still submits safely */}
          {isEssential && (
            <>
              <input type="hidden" name="openingHoursText" value="" />
              <input type="hidden" name="emergencyService" value="off" />
            </>
          )}
        </div>
      </motion.div>

      {/* ── Section 2: AI Receptionist ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-6 backdrop-blur-xl"
      >
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isEssential ? 'bg-zinc-800 text-zinc-500' : 'bg-violet-500/20 text-violet-400'}`}>2</div>
            <h2 className="text-base font-semibold text-white">Your AI Receptionist</h2>
            {isEssential && (
              <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Essential
              </span>
            )}
          </div>
          <p className="ml-8 text-xs text-zinc-500">
            {isEssential
              ? 'Your AI uses a default female receptionist. Customisation is available on the Professional plan.'
              : 'Customise how your receptionist sounds and introduces themselves.'}
          </p>
        </div>

        {isEssential ? (
          /* ── Essential: locked state ── */
          <div className="relative overflow-hidden rounded-xl border border-dashed border-zinc-700/60 bg-zinc-800/30">
            {/* What's included notice */}
            <div className="border-b border-zinc-800 px-5 py-4">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm font-medium text-zinc-300">
                  Default female AI receptionist included
                </p>
              </div>
              <p className="mt-1 ml-6 text-xs text-zinc-500">
                She will answer calls professionally on behalf of your business.
              </p>
            </div>

            {/* Locked features */}
            <div className="px-5 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
                🔒 Locked on Essential
              </p>
              <ul className="space-y-2">
                {LOCKED_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-600">
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Upgrade prompt */}
            <div className="border-t border-zinc-800 bg-violet-500/5 px-5 py-4">
              <p className="text-xs text-zinc-400">
                Unlock full customisation with{' '}
                <span className="font-semibold text-violet-300">Professional — £149/month</span>.
              </p>
              <Link
                href="/onboarding/plan"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
              >
                Switch to Professional
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Hidden defaults for Essential so form still submits */}
            <input type="hidden" name="receptionistName" value="Emma" />
            <input type="hidden" name="receptionistVoice" value="EMMA" />
            <input type="hidden" name="receptionistGender" value="FEMALE" />
            <input type="hidden" name="receptionistAccent" value="BRITISH" />
            <input type="hidden" name="receptionistTone" value="FRIENDLY" />
            <input type="hidden" name="greetingMessage" value="Hello and thank you for calling. How can I help you today?" />
          </div>
        ) : (
          /* ── Professional: full customisation ── */
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Receptionist Name">
              <input
                name="receptionistName"
                type="text"
                required
                defaultValue={defaults.receptionistName}
                placeholder="e.g. Emma"
                className={inputClass}
              />
            </Field>

            <Field label="Gender">
              <div className="grid grid-cols-2 gap-2">
                {['FEMALE', 'MALE'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`rounded-xl border py-2.5 text-sm font-medium transition-all ${
                      gender === g
                        ? 'border-blue-500/50 bg-blue-500/10 text-white'
                        : 'border-white/[0.07] bg-white/[0.02] text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {g === 'FEMALE' ? 'Female' : 'Male'}
                  </button>
                ))}
              </div>
              <input type="hidden" name="receptionistGender" value={gender} />
            </Field>

            <Field label="Accent">
              <select name="receptionistAccent" defaultValue={defaults.receptionistAccent} className={selectClass}>
                {ACCENTS.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Tone">
                <div className="grid grid-cols-4 gap-2">
                  {TONES.map(t => (
                    <label
                      key={t.value}
                      className="relative flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-center transition-all has-[:checked]:border-blue-500/50 has-[:checked]:bg-blue-500/10"
                    >
                      <input
                        type="radio"
                        name="receptionistTone"
                        value={t.value}
                        defaultChecked={defaults.receptionistTone === t.value}
                        className="sr-only"
                      />
                      <span className="text-xs font-medium text-zinc-300">{t.label}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            {/* Voice is set by gender — use EMMA for female, JAMES for male */}
            <input
              type="hidden"
              name="receptionistVoice"
              value={gender === 'MALE' ? 'JAMES' : 'EMMA'}
            />

            <div className="sm:col-span-2">
              <Field label="Greeting Message" hint="what callers hear first">
                <textarea
                  name="greetingMessage"
                  rows={3}
                  defaultValue={defaults.greetingMessage}
                  placeholder={`"Hello and thank you for calling. I'm Emma, your AI receptionist. How can I help you today?"`}
                  className={inputClass + ' resize-none'}
                />
              </Field>
            </div>
          </div>
        )}
      </motion.div>

      {/* Submit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 disabled:opacity-60"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </span>
          ) : (
            'Save & Continue →'
          )}
        </button>
      </motion.div>
    </form>
  )
}
