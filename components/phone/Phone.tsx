'use client'
import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'

export type PhoneState = 'idle' | 'ringing' | 'activeCall' | 'leadCapture' | 'dashboard' | 'success'

const waMsgs = [
  { from: 'TradeFlow AI', time: '09:43', lines: ['🔔 New lead captured', 'John Smith · +44 7700 900123', '📍 SW1A 1AA · Boiler repair', '⚡ URGENT'], delay: 0 },
  { from: 'TradeFlow AI', time: '09:44', lines: ['All job details saved ✓', 'Calendar slot offered', 'Follow-up scheduled'], delay: 1.2 },
]

function IdleScreen() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const fmt = () => {
      const d = new Date()
      setTime(d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
    }
    fmt()
    const t = setInterval(fmt, 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
      <p className="text-zinc-600 text-[10px] font-medium tracking-widest uppercase">TradeFlow AI</p>
      <p className="text-white text-4xl font-light tabular-nums">{time || '09:41'}</p>
      <p className="text-zinc-600 text-xs">Receptionist active</p>
      <div className="mt-4 flex gap-1.5">
        {[0,1,2].map(i => (
          <motion.div key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-500/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>
    </div>
  )
}

function RingingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 select-none">
      <p className="text-zinc-400 text-xs tracking-wider">INCOMING CALL</p>
      <motion.div
        className="relative flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-3xl">👤</span>
        <motion.div className="absolute inset-0 rounded-full border border-white/20"
          animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <motion.div className="absolute inset-0 rounded-full border border-white/10"
          animate={{ scale: [1, 2], opacity: [0.4, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
        />
      </motion.div>
      <div className="text-center">
        <p className="text-white font-semibold">Customer</p>
        <p className="text-zinc-500 text-xs mt-0.5">+44 7700 900 123</p>
      </div>
      <div className="flex gap-6 mt-2">
        <div className="flex flex-col items-center gap-1">
          <div className="h-12 w-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-zinc-600 text-[9px]">Decline</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <motion.div
            className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
            </svg>
          </motion.div>
          <p className="text-zinc-400 text-[9px]">AI answers</p>
        </div>
      </div>
    </div>
  )
}

function ActiveCallScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 select-none">
      <p className="text-zinc-400 text-xs tracking-wider">AI RECEPTIONIST ACTIVE</p>
      <motion.div
        className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
      >
        <svg className="w-7 h-7 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
        </svg>
      </motion.div>
      <div className="text-center">
        <p className="text-white text-sm font-medium">In conversation…</p>
        <p className="text-zinc-500 text-xs mt-0.5">Collecting job details</p>
      </div>
      {/* Waveform bars */}
      <div className="flex items-end gap-1 h-10">
        {[4,7,5,9,6,8,4,7,5,6,8,4,9,5,7].map((h, i) => (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-emerald-500/70"
            style={{ height: `${h * 4}px` }}
            animate={{ height: [`${h * 4}px`, `${(h * 2.5)}px`, `${h * 4}px`] }}
            transition={{ duration: 0.6 + i * 0.05, repeat: Infinity, ease: 'easeInOut', delay: i * 0.06 }}
          />
        ))}
      </div>
      <div className="bg-zinc-900 rounded-xl px-4 py-2 text-left w-full mx-4">
        <p className="text-zinc-500 text-[9px] mb-1">TRANSCRIPT</p>
        <motion.p className="text-zinc-300 text-xs leading-relaxed"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          "Can I take your name and postcode?"
        </motion.p>
      </div>
    </div>
  )
}

function LeadCaptureScreen() {
  const [visible, setVisible] = useState<number[]>([])
  useEffect(() => {
    setVisible([])
    const timers = waMsgs.map((m, i) =>
      setTimeout(() => setVisible(v => [...v, i]), m.delay * 1000)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* WA header */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2 shrink-0">
        <div className="h-7 w-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
        <div>
          <p className="text-white text-[10px] font-semibold">TradeFlow AI</p>
          <p className="text-emerald-400 text-[8px]">online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden px-3 py-3 flex flex-col justify-end gap-2">
        <AnimatePresence>
          {waMsgs.map((msg, i) =>
            visible.includes(i) ? (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#1a2b1f] border border-emerald-900/40 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[90%]"
              >
                <p className="text-emerald-400 text-[8px] font-semibold mb-1">{msg.from}</p>
                {msg.lines.map((l, j) => (
                  <p key={j} className="text-zinc-200 text-[10px] leading-relaxed">{l}</p>
                ))}
                <p className="text-zinc-600 text-[8px] mt-1 text-right">{msg.time}</p>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>

      {/* WA input stub */}
      <div className="border-t border-white/[0.06] px-3 py-2 flex gap-2 items-center shrink-0">
        <div className="flex-1 bg-zinc-800/60 rounded-full px-3 py-1.5">
          <p className="text-zinc-600 text-[10px]">Message</p>
        </div>
        <div className="h-7 w-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

function DashboardScreen() {
  const stats = [
    { label: 'Leads today', value: '12', color: 'text-blue-400' },
    { label: 'Booked', value: '8', color: 'text-emerald-400' },
    { label: 'Missed', value: '0', color: 'text-zinc-400' },
  ]
  return (
    <div className="flex flex-col h-full px-3 py-3 gap-3">
      <p className="text-zinc-500 text-[9px] font-semibold tracking-widest">DASHBOARD</p>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s, i) => (
          <div key={i} className="bg-zinc-900/80 rounded-xl p-2 text-center">
            <p className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-zinc-600 text-[8px] leading-tight mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        {['John Smith · Boiler repair · SW1A', 'Sarah Jones · Leak · E1 6RF', 'Mike Brown · Drain · N1 9EF'].map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="bg-zinc-900/60 border border-white/[0.04] rounded-lg px-2.5 py-2 flex items-center gap-2"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-zinc-300 text-[9px] truncate">{l}</p>
          </motion.div>
        ))}
      </div>
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2 text-center">
        <p className="text-blue-300 text-[9px] font-medium">AI Receptionist Active 24/7</p>
      </div>
    </div>
  )
}

function SuccessScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 select-none">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="h-20 w-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center"
      >
        <motion.svg
          className="w-10 h-10 text-emerald-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </motion.svg>
      </motion.div>
      <div className="text-center">
        <motion.p className="text-white font-semibold text-sm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          Job booked!
        </motion.p>
        <motion.p className="text-zinc-500 text-xs mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          Lead saved · SMS sent · Calendar updated
        </motion.p>
      </div>
      <motion.div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-center w-full mx-4"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
      >
        <p className="text-zinc-400 text-[9px]">John Smith · Boiler repair</p>
        <p className="text-emerald-300 text-[10px] font-medium mt-0.5">Thursday at 2:00 pm ✓</p>
      </motion.div>
    </div>
  )
}

const screenMap: Record<PhoneState, React.ReactNode> = {
  idle: <IdleScreen />,
  ringing: <RingingScreen />,
  activeCall: <ActiveCallScreen />,
  leadCapture: <LeadCaptureScreen />,
  dashboard: <DashboardScreen />,
  success: <SuccessScreen />,
}

export default function Phone({ state, className = '' }: { state: PhoneState; className?: string }) {
  const phoneRef = useRef<HTMLDivElement>(null)
  const vibTl = useRef<gsap.core.Timeline | null>(null)
  const prevState = useRef<PhoneState>('idle')

  useEffect(() => {
    const el = phoneRef.current
    if (!el) return

    // Kill existing vibration
    vibTl.current?.kill()
    gsap.set(el, { x: 0, rotation: 0 })

    if (state === 'ringing') {
      // tsss..tsss → pause → tsss..tsssss → pause pattern
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.7 })
      tl.to(el, { x: -3, rotation: -1.2, duration: 0.04, ease: 'none' })
        .to(el, { x: 3, rotation: 1.2, duration: 0.04, ease: 'none' })
        .to(el, { x: -2, rotation: -0.8, duration: 0.04, ease: 'none' })
        .to(el, { x: 2, rotation: 0.8, duration: 0.04, ease: 'none' })
        .to(el, { x: -1, rotation: -0.4, duration: 0.05, ease: 'none' })
        .to(el, { x: 0, rotation: 0, duration: 0.07, ease: 'power2.out' })
        .to(el, { x: 0, rotation: 0, duration: 0.35 }) // pause
        .to(el, { x: -3, rotation: -1.2, duration: 0.04, ease: 'none' })
        .to(el, { x: 3, rotation: 1.2, duration: 0.04, ease: 'none' })
        .to(el, { x: -3, rotation: -1.2, duration: 0.04, ease: 'none' })
        .to(el, { x: 3, rotation: 1.2, duration: 0.04, ease: 'none' })
        .to(el, { x: -2, rotation: -0.8, duration: 0.04, ease: 'none' })
        .to(el, { x: 2, rotation: 0.8, duration: 0.04, ease: 'none' })
        .to(el, { x: -1, rotation: -0.4, duration: 0.05, ease: 'none' })
        .to(el, { x: 0, rotation: 0, duration: 0.1, ease: 'power2.out' })
      vibTl.current = tl
    }

    // Subtle scale pop on state change
    if (prevState.current !== state) {
      gsap.fromTo(el, { scale: 0.97 }, { scale: 1, duration: 0.35, ease: 'back.out(1.4)' })
    }
    prevState.current = state

    return () => { vibTl.current?.kill() }
  }, [state])

  return (
    <div ref={phoneRef} className={`relative select-none ${className}`} style={{ willChange: 'transform' }}>
      {/* Phone shell */}
      <div className="relative w-[220px] h-[440px] rounded-[36px] bg-zinc-900 border border-white/10 shadow-2xl shadow-black/60 overflow-hidden">
        {/* Side buttons */}
        <div className="absolute -left-1 top-24 h-8 w-1 rounded-l bg-zinc-700" />
        <div className="absolute -left-1 top-36 h-12 w-1 rounded-l bg-zinc-700" />
        <div className="absolute -left-1 top-52 h-12 w-1 rounded-l bg-zinc-700" />
        <div className="absolute -right-1 top-32 h-16 w-1 rounded-r bg-zinc-700" />

        {/* Screen frame */}
        <div className="absolute inset-0 rounded-[36px] ring-1 ring-inset ring-white/[0.06]" />

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-24 bg-zinc-900 rounded-b-2xl z-20 flex items-center justify-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
          <div className="h-2 w-2 rounded-full bg-zinc-700" />
        </div>

        {/* Status bar */}
        <div className="absolute top-2 left-4 right-4 flex items-center justify-between z-10 pt-1">
          <span className="text-white text-[9px] font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M1.5 8.5c5.85-5.85 15.15-5.85 21 0M5.5 12.5c3.65-3.65 9.35-3.65 13 0M9.5 16.5c1.45-1.45 3.55-1.45 5 0M12 20.5h.01"/></svg>
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="11" rx="2"/><path d="M22 11v3a1 1 0 001-1v-1a1 1 0 00-1-1z"/></svg>
          </div>
        </div>

        {/* Screen content */}
        <div className="absolute inset-0 pt-8 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              className="absolute inset-0 pt-8 pb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {screenMap[state]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Home bar */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1 w-24 rounded-full bg-white/20" />

        {/* Shine overlay */}
        <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  )
}
