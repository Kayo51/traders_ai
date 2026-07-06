'use client'
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SignUpButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import Phone, { PhoneState } from '@/components/phone/Phone'
import ParticleFormation from '@/components/formations/ParticleFormation'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ─── Section wrappers ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-400/80">
      {children}
    </p>
  )
}

function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  )
}

// ─── Ambient glows ─────────────────────────────────────────────────────────────

function Glow({ color, className }: { color: string; className: string }) {
  return <div className={`pointer-events-none absolute rounded-full blur-[120px] opacity-[0.07] ${color} ${className}`} />
}

// ─── Booking modal ─────────────────────────────────────────────────────────────

function BookingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [fields, setFields] = useState({ name: '', email: '', phone: '', trade: '' })

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (!res.ok) throw new Error('Failed')
      setStep('success')
    } catch {
      alert('Something went wrong — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0d0d0d] p-8 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-zinc-600 hover:text-zinc-300 transition-colors text-xl leading-none"
          >
            ✕
          </button>

          {step === 'form' ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400/80 mb-1">Book a demo</p>
              <h2 className="text-xl font-bold text-white mb-1">See JobBell in action</h2>
              <p className="text-sm text-zinc-500 mb-6">We&apos;ll walk you through the whole system live — usually 20 minutes.</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400">Your name</label>
                  <input
                    required
                    value={fields.name}
                    onChange={set('name')}
                    placeholder="James Smith"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400">Email address</label>
                  <input
                    required
                    type="email"
                    value={fields.email}
                    onChange={set('email')}
                    placeholder="james@smithplumbing.co.uk"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400">Phone number</label>
                  <input
                    required
                    type="tel"
                    value={fields.phone}
                    onChange={set('phone')}
                    placeholder="+44 7700 900123"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400">Trade</label>
                  <select
                    required
                    value={fields.trade}
                    onChange={set('trade')}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0d0d0d] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition appearance-none"
                  >
                    <option value="" disabled>Select your trade</option>
                    <option>Plumber</option>
                    <option>Electrician</option>
                    <option>Builder</option>
                    <option>Gas Engineer</option>
                    <option>HVAC / Heating</option>
                    <option>Roofer</option>
                    <option>Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-full bg-white py-3 text-sm font-semibold text-black hover:bg-zinc-100 transition-all disabled:opacity-60 shadow-lg shadow-white/10"
                >
                  {loading ? 'Booking…' : 'Book my demo'}
                </button>
              </form>
              <p className="mt-4 text-center text-xs text-zinc-700">No commitment. We&apos;ll be in touch within the hour.</p>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">You&apos;re booked in</h2>
              <p className="text-sm text-zinc-400 mb-1">We&apos;ll call you on <span className="text-white font-medium">{fields.phone}</span> to confirm a time.</p>
              <p className="text-sm text-zinc-500">Check <span className="text-white font-medium">{fields.email}</span> for your calendar invite.</p>
              <button
                onClick={onClose}
                className="mt-8 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-zinc-300 hover:border-white/20 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function HeroContent({ onBookDemo, isSignedIn }: { onBookDemo: () => void; isSignedIn: boolean }) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, 80])
  const op = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <motion.div style={{ y, opacity: op }} className="flex flex-col items-start">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1.5"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
        <span className="text-xs font-medium tracking-wide text-blue-300">
          Built for UK trade businesses
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="text-4xl font-bold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl"
      >
        Never miss a<br />
        <GradientText>customer again.</GradientText>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 max-w-md text-base leading-relaxed text-zinc-400"
      >
        Your AI voice receptionist answers every call instantly — even when you're on a job.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-2 text-sm text-zinc-600"
      >
        Built for UK plumbers, electricians, and trade businesses.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 flex flex-wrap gap-3"
      >
        {isSignedIn ? (
          <Link href="/dashboard/leads" className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black hover:bg-zinc-100 transition-colors shadow-lg shadow-white/10">
            Go to Dashboard
          </Link>
        ) : (
          <SignUpButton mode="modal">
            <button className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black hover:bg-zinc-100 transition-colors shadow-lg shadow-white/10">
              Get Started
            </button>
          </SignUpButton>
        )}
        <button
          onClick={onBookDemo}
          className="rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-300 hover:border-white/20 hover:text-white transition-colors"
        >
          Book a Demo
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─── SMS notification card (for Live Demo section) ─────────────────────────────

function WACard({ delay, title, lines, time }: {
  delay: number; title: string; lines: string[]; time: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#1a2b1f] border border-emerald-900/40 rounded-2xl rounded-tl-sm px-5 py-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <p className="text-emerald-400 text-xs font-semibold">{title}</p>
        <p className="ml-auto text-zinc-600 text-[10px]">{time}</p>
      </div>
      {lines.map((l, i) => (
        <p key={i} className="text-zinc-300 text-sm leading-relaxed">{l}</p>
      ))}
    </motion.div>
  )
}

// ─── Pricing card ──────────────────────────────────────────────────────────────

function PricingCard({
  name, price, perDay, desc, features, lockedFeatures, highlighted, cta, roi,
}: {
  name: string
  price: string
  perDay?: string
  desc: string
  features: string[]
  lockedFeatures?: string[]
  highlighted?: boolean
  cta: string
  roi?: string
}) {
  return (
    <div className={`relative rounded-3xl border flex flex-col gap-6 transition-all ${
      highlighted
        ? 'border-violet-500/50 bg-gradient-to-b from-violet-500/10 via-blue-500/5 to-transparent p-8 shadow-[0_0_60px_rgba(139,92,246,0.15)]'
        : 'border-white/[0.06] bg-white/[0.02] p-8'
    }`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-violet-500/30 tracking-wide">
            ⭐ BEST VALUE
          </span>
        </div>
      )}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{name}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-5xl font-bold text-white">{price}</p>
          <span className="text-base font-normal text-zinc-500">/mo</span>
        </div>
        {perDay && (
          <p className="mt-1 text-xs text-zinc-600">{perDay}</p>
        )}
        <p className="mt-2 text-sm text-zinc-400">{desc}</p>
        {roi && (
          <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
            <p className="text-xs text-emerald-400 font-medium">💰 {roi}</p>
          </div>
        )}
      </div>
      <ul className="flex flex-col gap-2.5 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
            <svg className="mt-0.5 w-4 h-4 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
        {lockedFeatures?.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-600">
            <svg className="mt-0.5 w-4 h-4 shrink-0 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <SignUpButton mode="modal">
        <button className={`w-full rounded-full py-3.5 text-sm font-semibold transition-all ${
          highlighted
            ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02]'
            : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
        }`}>
          {cta}
        </button>
      </SignUpButton>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { isSignedIn } = useUser()
  const [phoneState, setPhoneState] = useState<PhoneState>('idle')
  const [bookingOpen, setBookingOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const finalSectionRef = useRef<HTMLElement>(null)

  // Section refs for ScrollTrigger
  const heroRef = useRef<HTMLElement>(null)
  const problemRef = useRef<HTMLElement>(null)
  const solutionRef = useRef<HTMLElement>(null)
  const howRef = useRef<HTMLElement>(null)
  const demoRef = useRef<HTMLElement>(null)
  const automationRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  const outcomeRef = useRef<HTMLElement>(null)

  const go = useCallback((s: PhoneState) => setPhoneState(s), [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      const makePin = (ref: React.RefObject<HTMLElement | null>, onEnter: PhoneState, onLeave?: PhoneState) => {
        if (!ref.current) return
        ScrollTrigger.create({
          trigger: ref.current,
          start: 'top 40%',
          end: 'bottom 40%',
          onEnter: () => go(onEnter),
          onEnterBack: () => go(onEnter),
          ...(onLeave ? { onLeave: () => go(onLeave) } : {}),
        })
      }

      makePin(heroRef, 'idle')
      makePin(problemRef, 'idle')
      makePin(solutionRef, 'ringing')
      makePin(howRef, 'activeCall')
      makePin(demoRef, 'leadCapture')
      makePin(automationRef, 'dashboard')
      makePin(featuresRef, 'dashboard')
      makePin(outcomeRef, 'success')


    }, containerRef)

    return () => ctx.revert()
  }, [go])

  return (
    <div ref={containerRef} className="bg-[#030303] text-white">
      {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} />}

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <Glow color="bg-blue-500" className="w-[700px] h-[700px] -top-32 left-1/4" />
        <Glow color="bg-violet-500" className="w-[500px] h-[500px] top-1/4 right-1/4" />

        {/* Dot grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)' }}
        />

        <div className="relative mx-auto w-full max-w-6xl px-6 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <HeroContent onBookDemo={() => setBookingOpen(true)} isSignedIn={!!isSignedIn} />
            </div>
            <div className="flex justify-center lg:justify-end shrink-0">
              <Phone state={phoneState} className="drop-shadow-2xl" />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#030303] to-transparent" />
      </section>

      {/* ── Problem ──────────────────────────────────────────────────────────── */}
      <section ref={problemRef} className="relative py-28 overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 order-2 lg:order-1">
              <SectionLabel>The problem</SectionLabel>
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Every missed call<br />is <GradientText>lost money.</GradientText>
              </h2>
              <p className="mt-5 text-zinc-400 leading-relaxed">
                When you're busy on a job, customers don't wait — they call the next business.
              </p>
              <p className="mt-2 text-zinc-600 text-sm">Most trade businesses lose thousands every month from missed calls.</p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  'Missed calls on the job',
                  'Lost leads to competitors',
                  'No answer after hours',
                  'Customers give up calling',
                ].map((label, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="flex items-center rounded-xl border border-red-500/10 bg-red-500/[0.04] px-4 py-3"
                  >
                    <p className="text-base font-medium text-zinc-300">{label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="shrink-0 order-1 lg:order-2 flex justify-center lg:hidden">
              <div className="relative w-64 h-48 rounded-2xl border border-red-500/10 bg-red-500/[0.03] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-5xl font-bold text-red-400">73%</p>
                  <p className="mt-2 text-zinc-500 text-sm">of callers won't call back</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Solution ─────────────────────────────────────────────────────────── */}
      <section ref={solutionRef} className="relative py-28 overflow-hidden">
        <Glow color="bg-blue-500" className="w-[600px] h-[600px] top-1/2 -translate-y-1/2 -left-48" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="shrink-0 hidden lg:flex justify-center">
              <Phone state={phoneState} className="drop-shadow-2xl" />
            </div>
            <div className="flex-1">
              <SectionLabel>The solution</SectionLabel>
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Meet your AI<br /><GradientText>voice receptionist.</GradientText>
              </h2>
              <p className="mt-5 text-zinc-400 leading-relaxed">
                It answers every call instantly and captures job details for you.
              </p>
              <p className="mt-2 text-zinc-600 text-sm">No more missed opportunities.</p>

              <div className="mt-8 flex flex-col gap-3">
                {[
                  { label: 'Answers in under 1 second', sub: 'No hold music. No voicemail.' },
                  { label: 'Natural AI voice conversation', sub: 'Callers don\'t know it\'s AI.' },
                  { label: 'Instant SMS & email alerts', sub: 'You get the lead immediately.' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4"
                  >
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section ref={howRef} className="relative py-28 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        <div className="relative mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <SectionLabel>Process</SectionLabel>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              How it <GradientText>works</GradientText>
            </h2>
            <p className="mt-4 text-zinc-500 text-sm">Simple. Automatic. Reliable.</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-blue-500/40 via-violet-500/30 to-transparent" />
                <div className="flex flex-col gap-10">
                  {[
                    { n: '01', title: 'Customer calls your business', desc: 'Every inbound call goes straight to your JobBell — no hold music, no voicemail, no missed rings.' },
                    { n: '02', title: 'AI answers instantly', desc: 'Your AI receptionist greets the caller naturally and asks the right questions about their job.' },
                    { n: '03', title: 'Job details are saved', desc: 'Name, number, postcode, issue — all captured in seconds and saved to your dashboard.' },
                    { n: '04', title: 'Sent to you immediately', desc: 'You get an SMS alert the moment the call ends. The lead is yours.' },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                      className="relative flex gap-5"
                    >
                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 border border-white/[0.08] shadow-lg">
                        <span className="text-sm font-bold text-zinc-400">{s.n}</span>
                      </div>
                      <div className="pt-1.5">
                        <p className="text-sm font-semibold text-white">{s.title}</p>
                        <p className="mt-1 text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex justify-center hidden lg:flex">
              <Phone state={phoneState} className="drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Demo ─────────────────────────────────────────────────────────── */}
      <section ref={demoRef} id="demo" className="relative py-28 overflow-hidden">
        <Glow color="bg-emerald-500" className="w-[500px] h-[500px] top-1/2 -translate-y-1/2 right-0" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <SectionLabel>Live demo</SectionLabel>
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                See it <GradientText>in action</GradientText>
              </h2>
              <p className="mt-5 text-zinc-400 leading-relaxed">
                Watch how a real job is captured in seconds. No missed calls. No lost work.
              </p>

              <div className="mt-8 flex flex-col gap-3 max-w-md">
                <WACard
                  delay={0.1}
                  title="JobBell — New Lead"
                  time="09:43"
                  lines={[
                    'John Smith · +44 7700 900123',
                    'SW1A 1AA · URGENT · Boiler repair',
                    'Thursday 3rd July, 10am booked',
                  ]}
                />
                <WACard
                  delay={0.3}
                  title="JobBell — Confirmed"
                  time="09:44"
                  lines={[
                    'Calendar updated',
                    'Confirmation SMS sent to caller',
                    'Reminder scheduled for Wed evening',
                  ]}
                />
              </div>
            </div>

            <div className="shrink-0 hidden lg:flex justify-center">
              <Phone state={phoneState} className="drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Automation Loop ──────────────────────────────────────────────────── */}
      <section ref={automationRef} className="relative py-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <Glow color="bg-violet-500" className="w-[700px] h-[600px] top-1/2 -translate-y-1/2 right-0" />

        <div className="relative mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="mb-14"
          >
            <SectionLabel>End-to-end automation</SectionLabel>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Answers the call.<br />
              <GradientText>Books the job. Handles the rest.</GradientText>
            </h2>
            <p className="mt-4 max-w-xl text-zinc-400 leading-relaxed">
              Most receptionists stop when the call ends. JobBell doesn&apos;t — it confirms, reminds, and re-engages your leads automatically, without you lifting a finger.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-5 top-5 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-violet-500/30 to-transparent" />
              <div className="flex flex-col gap-8">
                {[
                  { when: 'During the call', title: 'Calendar slot locked in', desc: 'While the AI is still on the phone, it pulls your live availability and agrees a date and time with the caller — no back and forth.' },
                  { when: 'The moment the call ends', title: 'You get the SMS alert', desc: 'Full lead details — name, number, postcode, job type, urgency — delivered by text before you\'ve even put down your tools.' },
                  { when: 'Instantly after', title: 'Caller gets a confirmation SMS', desc: 'Your customer receives their booking details automatically. Professionalises your business without any manual effort.' },
                  { when: '24 hours before the job', title: 'Reminder sent to the caller', desc: 'Cuts no-shows. Your customer gets a reminder so they\'re ready, and you don\'t waste a trip.' },
                  { when: '48h with no response', title: 'Re-engagement triggered', desc: 'If a caller never confirmed their slot, JobBell follows up automatically — recovering leads that would otherwise go cold.' },
                  { when: '7 days of silence', title: 'Win-back message sent', desc: '"Still need a hand?" — sent automatically to reignite interest and recover jobs that slipped through the cracks.' },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.45, delay: i * 0.06 }}
                    className="relative flex gap-5"
                  >
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 border border-white/[0.08] shadow-md">
                      <span className="text-[10px] font-bold text-zinc-500">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400/70 mb-0.5">{step.when}</p>
                      <p className="text-sm font-semibold text-white">{step.title}</p>
                      <p className="mt-0.5 text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Customer message bubbles */}
            <div className="flex flex-col gap-4">
              <p className="text-xs text-zinc-600 uppercase tracking-widest mb-1">What your customers receive</p>
              {[
                {
                  tag: 'Booking Confirmation — sent instantly',
                  tagColor: 'text-blue-400/70',
                  border: 'border-blue-500/15 bg-blue-500/[0.04]',
                  text: 'Hi John — your boiler repair with [Business Name] is confirmed for Thursday 3rd July at 10am. We\'ll send you a reminder the day before. Reply CONFIRM to secure your slot.',
                  time: 'Delivered instantly after the call',
                },
                {
                  tag: 'Appointment Reminder — 24h before',
                  tagColor: 'text-violet-400/70',
                  border: 'border-violet-500/15 bg-violet-500/[0.04]',
                  text: 'Reminder: Your appointment is tomorrow, Thursday 3rd July at 10am. Your tradesman will call ahead. See you then!',
                  time: 'Auto-sent the evening before',
                },
                {
                  tag: 'Re-engagement — 48h no response',
                  tagColor: 'text-amber-400/70',
                  border: 'border-amber-500/15 bg-amber-500/[0.04]',
                  text: 'Hi John — we haven\'t heard back about your boiler repair booking. Your slot is still held. Reply YES to confirm or CANCEL if your plans have changed.',
                  time: 'Auto-sent if no reply after 48 hours',
                },
                {
                  tag: 'Win-back — 7 days later',
                  tagColor: 'text-emerald-400/70',
                  border: 'border-emerald-500/15 bg-emerald-500/[0.04]',
                  text: 'Hi John — you reached out about a boiler repair last week. Still need a hand? We have availability this week. Just reply and we\'ll get you sorted.',
                  time: 'Auto-sent after 7 days of silence',
                },
              ].map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.4, delay: i * 0.09 }}
                >
                  <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1.5 ${m.tagColor}`}>{m.tag}</p>
                  <div className={`rounded-2xl rounded-tl-sm border px-4 py-3.5 ${m.border}`}>
                    <p className="text-[11px] text-zinc-500 mb-1.5 font-medium">SMS to customer</p>
                    <p className="text-sm text-zinc-200 leading-relaxed">{m.text}</p>
                    <p className="text-[10px] text-zinc-600 mt-2.5 text-right">{m.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────────── */}
      <section ref={featuresRef} className="relative py-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <Glow color="bg-blue-500" className="w-[600px] h-[400px] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2" />

        <div className="relative mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <SectionLabel>Features</SectionLabel>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Everything you need to<br />
              <GradientText>never miss a job again</GradientText>
            </h2>
            <p className="mt-4 text-zinc-500 text-sm">Built for real trade businesses, not tech companies.</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'AI Voice Receptionist', desc: 'Answers every call in under a second. Natural voice, no hold music, available 24 hours a day, 7 days a week.', accent: 'border-blue-500/15 from-blue-500/8' },
              { title: 'Instant SMS Alerts', desc: 'Full lead details delivered by text the moment the call ends — before you\'ve put your tools down.', accent: 'border-emerald-500/15 from-emerald-500/8' },
              { title: 'Live Calendar Booking', desc: 'The AI checks your real availability during the call and locks in a date and time before the conversation ends.', accent: 'border-violet-500/15 from-violet-500/8' },
              { title: 'Customer Confirmation SMS', desc: 'Every caller receives a professional booking confirmation immediately after the call. No manual follow-up required.', accent: 'border-cyan-500/15 from-cyan-500/8' },
              { title: 'Appointment Reminders', desc: 'Automated reminders sent to your customers before the job — cutting no-shows and wasted journeys.', accent: 'border-indigo-500/15 from-indigo-500/8' },
              { title: 'Lead Re-engagement', desc: 'Callers who don\'t respond get an automatic follow-up. Jobs that would have gone cold are recovered without you doing a thing.', accent: 'border-amber-500/15 from-amber-500/8' },
              { title: 'Priority Lead Scoring', desc: 'The AI identifies urgent jobs and flags them first — so you know which leads to call back before end of day.', accent: 'border-rose-500/15 from-rose-500/8' },
              { title: 'Leads Dashboard', desc: 'Every call, every lead, every status — in one clean dashboard. Filter by postcode, job type, or urgency at a glance.', accent: 'border-pink-500/15 from-pink-500/8' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className={`rounded-2xl border bg-gradient-to-b ${f.accent} to-transparent p-6 cursor-default`}
              >
                <h3 className="mb-2 text-sm font-semibold text-white">{f.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Outcome ───────────────────────────────────────────────────────────── */}
      <section ref={outcomeRef} className="relative py-28 overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <SectionLabel>Results</SectionLabel>
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                More jobs.<br /><GradientText>Less stress.</GradientText>
              </h2>
              <p className="mt-5 text-zinc-400 leading-relaxed">
                Turn every call into a booked job automatically.
              </p>
              <p className="mt-2 text-zinc-600 text-sm">One missed call could cost more than your monthly plan.</p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { value: '100%', label: 'Call answer rate' },
                  { value: '<2s', label: 'Response time' },
                  { value: '24/7', label: 'Always available' },
                  { value: '£0', label: 'Missed opportunities' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center"
                  >
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="mt-1 text-xs text-zinc-500">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="shrink-0 hidden lg:flex justify-center">
              <Phone state={phoneState} className="drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────────── */}
      <section className="relative py-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <Glow color="bg-violet-500" className="w-[600px] h-[500px] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2" />

        <div className="relative mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Simple pricing that<br /><GradientText>grows with your business</GradientText>
            </h2>
          </motion.div>

          {/* Receptionist comparison anchor */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto mb-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-4 text-center"
          >
            <p className="text-sm text-zinc-400">
              A part-time receptionist costs <span className="line-through text-zinc-600">£800+/month</span>
              {' '}and still misses calls. JobBell answers <span className="text-white font-semibold">every single one</span> for £149.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 max-w-3xl mx-auto items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <PricingCard
                name="Essential"
                price="£99"
                desc="For sole traders who want to stop missing calls"
                features={[
                  'AI voice receptionist 24/7',
                  'Instant SMS & email lead alerts',
                  'Tap-to-call button in every alert',
                  'Lead capture dashboard',
                  '150 call minutes/month',
                  '14-day free trial',
                ]}
                lockedFeatures={[
                  'Quote chaser (auto follow-up)',
                  'Google review automation',
                  '"On My Way" notifications',
                  'Appointment booking & reminders',
                ]}
                cta="Start Free Trial"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <PricingCard
                name="Professional"
                price="£149"
                perDay="£4.97/day — less than a takeaway coffee"
                desc="For tradespeople serious about growing their business"
                highlighted
                roi="One recovered quote pays for 2 months"
                features={[
                  'Everything in Essential',
                  'Quote chaser — auto follow-up at day 3 & 7',
                  'Google review automation after every job',
                  '"On My Way" customer notifications',
                  'Google Calendar appointment booking',
                  '24h & 5h appointment reminders',
                  '300 call minutes/month',
                  'Custom receptionist name & voice',
                  'Priority support',
                ]}
                cta="Start Free Trial — Best Value"
              />
            </motion.div>
          </div>

          <p className="mt-8 text-center text-xs text-zinc-600">
            14-day free trial · No credit card required · Cancel anytime · No contracts
          </p>
        </div>
      </section>

      {/* ── Final CTA + Particle Formation ───────────────────────────────────── */}
      <section ref={finalSectionRef as React.RefObject<HTMLElement>} className="relative overflow-hidden" style={{ minHeight: '140vh' }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <Glow color="bg-blue-500" className="w-[500px] h-[500px] top-1/2 -translate-y-1/2 -left-32" />
        <Glow color="bg-violet-500" className="w-[400px] h-[400px] top-1/3 right-0" />

        <div className="relative mx-auto max-w-6xl px-6 h-full min-h-screen flex items-center">
          <div className="flex flex-col lg:flex-row items-center gap-12 w-full py-28">
            {/* Particle formation — left */}
            <div className="relative w-full lg:w-[520px] shrink-0" style={{ height: 560 }}>
              <ParticleFormation sectionRef={finalSectionRef} />
              <div className="absolute bottom-0 left-0 right-0 text-center pointer-events-none">
                <p className="text-zinc-800 text-[9px] tracking-widest uppercase">AI Receptionist</p>
              </div>
            </div>

            {/* CTA — right */}
            <div className="flex-1 text-center lg:text-left">
              <SectionLabel>Get started today</SectionLabel>
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Stop missing calls.<br />
                <GradientText>Start capturing every job.</GradientText>
              </h2>
              <p className="mt-5 text-zinc-400 leading-relaxed">
                JobBell runs your reception 24/7 so you never lose work again.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                {isSignedIn ? (
                  <Link href="/dashboard/leads" className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black hover:bg-zinc-100 transition-all shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.02]">
                    Go to Dashboard
                  </Link>
                ) : (
                  <SignUpButton mode="modal">
                    <button className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black hover:bg-zinc-100 transition-all shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.02]">
                      Sign up to see prices
                    </button>
                  </SignUpButton>
                )}
                <button
                  onClick={() => setBookingOpen(true)}
                  className="rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-medium text-zinc-300 hover:border-white/20 hover:text-white transition-colors"
                >
                  Book a Demo
                </button>
              </div>

              <p className="mt-5 text-xs text-zinc-700">
                Setup in minutes · Cancel anytime · No contracts
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative border-t border-white/[0.05] py-8">
          <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-semibold text-white">JobBell</p>
            <p className="text-xs text-zinc-700">© 2026 JobBell. Built for UK trade businesses.</p>
          </div>
        </div>
      </section>

    </div>
  )
}
