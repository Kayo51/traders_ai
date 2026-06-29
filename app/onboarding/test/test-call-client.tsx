'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { simulateTestCall } from '../actions'

const URGENCY_BADGE: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  LOW:         { label: 'Low',         dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50' },
  MODERATE:    { label: 'Moderate',    dot: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  HIGH:        { label: 'High',        dot: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50' },
  VERY_URGENT: { label: 'Very Urgent', dot: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50' },
}

type LeadData = {
  id: string
  callerName: string | null
  callerPhone: string
  jobType: string | null
  description: string | null
  postcode: string | null
  urgency: string
  status: string
  createdAt: string
}

type Phase = 'idle' | 'simulating' | 'success'

function ConfettiParticle({ delay, color, x }: { delay: number; color: string; x: number }) {
  return (
    <motion.div
      initial={{ y: -20, x, opacity: 1, rotate: 0 }}
      animate={{ y: 400, opacity: 0, rotate: Math.random() > 0.5 ? 360 : -360 }}
      transition={{ duration: 1.8 + Math.random() * 0.8, delay, ease: 'easeIn' }}
      className="pointer-events-none absolute top-0 h-2.5 w-2.5 rounded-sm"
      style={{ backgroundColor: color, left: `${x}%` }}
    />
  )
}

const CONFETTI_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4']

export default function TestCallClient({
  phone,
  receptionistName,
}: {
  phone: string | null
  receptionistName: string
}) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [lead, setLead] = useState<LeadData | null>(null)
  const [callDuration, setCallDuration] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const confettiRef = useRef<boolean>(false)

  const [confettiParticles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      delay: Math.random() * 0.8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      x: Math.random() * 90 + 5,
    }))
  )

  const handleSimulate = () => {
    setPhase('simulating')
    startTransition(async () => {
      try {
        const result = await simulateTestCall()
        setTimeout(() => {
          setLead(result.lead)
          setCallDuration(result.call.durationSeconds)
          setPhase('success')
        }, 2500)
      } catch {
        setPhase('idle')
      }
    })
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-5">
      {/* Phone number card */}
      {phone && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-xl">📞</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Your Receptionist Number</p>
              <p className="text-2xl font-bold tracking-tight text-white">{phone}</p>
            </div>
          </div>
          <p className="text-sm text-zinc-400">
            Call this number from your phone to experience exactly what your customers will hear.{' '}
            <strong className="text-zinc-300">{receptionistName}</strong> will answer and collect their details.
          </p>
        </motion.div>
      )}

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-5"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">What happens when someone calls</p>
        <div className="space-y-3">
          {[
            { icon: '🤖', text: `${receptionistName} answers and greets the caller` },
            { icon: '📋', text: 'AI collects name, phone, postcode and job details' },
            { icon: '📲', text: 'You get an SMS and email with the full lead' },
            { icon: '📊', text: 'Lead appears in your dashboard instantly' },
          ].map(item => (
            <div key={item.text} className="flex items-start gap-3">
              <span className="mt-0.5 text-base">{item.icon}</span>
              <p className="text-sm text-zinc-400">{item.text}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Simulate button */}
      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={handleSimulate}
              className="w-full rounded-xl border border-dashed border-violet-500/30 bg-violet-500/5 py-4 text-sm font-semibold text-violet-300 transition-all hover:border-violet-500/50 hover:bg-violet-500/10"
            >
              🧪 Simulate a Test Call
            </button>
            <p className="mt-2 text-center text-xs text-zinc-600">
              Creates a demo lead so you can see the experience without making a real call
            </p>
          </motion.div>
        )}

        {phase === 'simulating' && (
          <motion.div
            key="simulating"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-6"
          >
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative h-14 w-14">
                <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
                <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-blue-400" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">📞</div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">Simulating incoming call…</p>
                <p className="mt-1 text-xs text-zinc-500">{receptionistName} is answering and collecting details</p>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                {[
                  'Call connected…',
                  `${receptionistName} greeting caller…`,
                  'Collecting job details…',
                  'Lead being captured…',
                ].map((msg, i) => (
                  <motion.div
                    key={msg}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.5 }}
                    className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-3 py-1.5"
                  >
                    <div className="h-1 w-1 animate-pulse rounded-full bg-blue-400" />
                    <span className="text-xs text-zinc-500">{msg}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'success' && lead && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden"
          >
            {/* Confetti */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {confettiParticles.map(p => (
                <ConfettiParticle key={p.id} delay={p.delay} color={p.color} x={p.x} />
              ))}
            </div>

            {/* Success banner */}
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <svg className="h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-semibold text-emerald-300">
                Your AI successfully answered the call and captured a lead!
              </p>
            </div>

            {/* Lead card */}
            <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/80 p-5 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Test Lead Captured</p>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
                  Captured Successfully
                </span>
              </div>

              <dl className="space-y-2.5">
                {/* Urgency badge */}
                {(() => {
                  const ub = URGENCY_BADGE[lead.urgency]
                  return ub ? (
                    <div className="flex justify-between gap-4 items-center">
                      <dt className="text-xs text-zinc-500">Urgency</dt>
                      <dd>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${ub.bg} ${ub.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${ub.dot}`} />
                          {ub.label}
                        </span>
                      </dd>
                    </div>
                  ) : null
                })()}
                {[
                  { label: 'Customer', value: lead.callerName ?? '—' },
                  { label: 'Phone', value: lead.callerPhone },
                  { label: 'Issue', value: lead.jobType ?? '—' },
                  { label: 'Description', value: lead.description ?? '—' },
                  { label: 'Postcode', value: lead.postcode ?? '—' },
                  { label: 'Date', value: formatDate(lead.createdAt) },
                  { label: 'Duration', value: callDuration ? `${callDuration}s` : '—' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between gap-4">
                    <dt className="text-xs text-zinc-500">{item.label}</dt>
                    <dd className="text-right text-xs font-medium text-white">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setPhase('idle')}
                className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                Test Again
              </button>
              <Link
                href="/dashboard"
                className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/20"
              >
                Go To Dashboard →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
