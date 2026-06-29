'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { assignNumber } from '../actions'
import { formatPhoneNumber } from '@/lib/phone-utils'

type Phase = 'searching' | 'found' | 'error'

export default function NumberAssignment({ initialNumber }: { initialNumber?: string }) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>(initialNumber ? 'found' : 'searching')
  const [number, setNumber] = useState(initialNumber ?? '')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (initialNumber) return

    const timer = setTimeout(async () => {
      try {
        const result = await assignNumber()
        setNumber(formatPhoneNumber(result.number))
        setPhase('found')
      } catch {
        setPhase('error')
      }
    }, 1800)

    return () => clearTimeout(timer)
  }, [initialNumber])

  const handleContinue = () => {
    startTransition(() => {
      router.push('/onboarding/setup')
    })
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-8 backdrop-blur-xl">
        <AnimatePresence mode="wait">
          {phase === 'searching' && (
            <motion.div
              key="searching"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-6 py-8"
            >
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-2 border-blue-500/20 bg-blue-500/10" />
                <div className="absolute inset-0 animate-spin">
                  <div className="h-16 w-16 rounded-full border-2 border-transparent border-t-blue-500" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white">Searching for available numbers…</p>
                <p className="mt-1 text-sm text-zinc-500">This only takes a moment.</p>
              </div>

              <div className="flex flex-col gap-2 w-full">
                {['Connecting to network…', 'Scanning UK numbers…', 'Reserving your number…'].map((msg, i) => (
                  <motion.div
                    key={msg}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.4 }}
                    className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2"
                  >
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                    <span className="text-xs text-zinc-500">{msg}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'found' && (
            <motion.div
              key="found"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-6"
            >
              {/* Success icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30"
              >
                <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              {/* Number display */}
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                  Your dedicated number
                </p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
                >
                  {number}
                </motion.p>
              </div>

              {/* Info cards */}
              <div className="grid w-full grid-cols-2 gap-3">
                {[
                  { icon: '📞', label: 'Answers calls', desc: '24/7 automatically' },
                  { icon: '📲', label: 'SMS alerts', desc: 'Instant to your phone' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-center">
                    <span className="text-xl">{item.icon}</span>
                    <p className="mt-1 text-xs font-semibold text-white">{item.label}</p>
                    <p className="text-[10px] text-zinc-500">{item.desc}</p>
                  </div>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={handleContinue}
                disabled={isPending}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 disabled:opacity-60"
              >
                {isPending ? 'Loading…' : 'Continue to Setup →'}
              </motion.button>
            </motion.div>
          )}

          {phase === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-8 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-white font-semibold">Something went wrong</p>
              <p className="text-sm text-zinc-500">We couldn&apos;t assign a number. Please try again.</p>
              <button
                onClick={() => setPhase('searching')}
                className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/5"
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
