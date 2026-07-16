'use client'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

const floatingCards = [
  {
    icon: '📞',
    title: 'Incoming call',
    body: 'John Smith · +44 7700 900123',
    sub: 'Boiler repair needed',
    color: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/20',
    delay: 0.6,
    position: 'left-0 top-0',
    float: 0,
  },
  {
    icon: '✓',
    title: 'Lead captured',
    body: 'SW1A 1AA · Emergency',
    sub: 'All details collected',
    color: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/20',
    delay: 0.8,
    position: 'right-0 top-8',
    float: -8,
  },
  {
    icon: '💬',
    title: 'SMS sent',
    body: 'Plumber notified instantly',
    sub: 'Response time: 2s',
    color: 'from-violet-500/20 to-violet-600/5',
    border: 'border-violet-500/20',
    delay: 1.0,
    position: 'left-1/4 bottom-0',
    float: 6,
  },
]

export default function Hero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 700], [0, 140])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030303]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-[700px] w-[700px] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute top-1/4 right-1/3 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-blue-800/10 blur-[100px]" />
      </div>

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
        }}
      />

      <motion.div style={{ y, opacity }} className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-32 pb-24">
        <div className="flex flex-col items-center text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1.5"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            <span className="text-xs font-medium tracking-wide text-blue-300">
              AI-powered receptionist for UK plumbers
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Never miss a{' '}
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">
              plumbing job
            </span>{' '}
            again with AI
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400"
          >
            TradeSpeak answers every call, collects customer details, and sends
            you an instant SMS — 24/7, automatically. Never lose a lead again.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/sign-up"
              className="rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-105"
            >
              Get started free
            </Link>
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
            >
              View dashboard
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </motion.div>

          {/* Floating UI cards */}
          <div className="relative mt-24 h-64 w-full max-w-2xl">
            {floatingCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: [card.float, card.float - 10, card.float],
                  scale: 1,
                }}
                transition={{
                  opacity: { delay: card.delay, duration: 0.5 },
                  scale: { delay: card.delay, duration: 0.5 },
                  y: {
                    delay: card.delay,
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
                className={`absolute ${card.position} w-56 rounded-2xl border ${card.border} bg-gradient-to-br ${card.color} p-4 backdrop-blur-md`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{card.icon}</span>
                  <span className="text-xs font-semibold text-white">{card.title}</span>
                </div>
                <p className="text-xs text-zinc-300">{card.body}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{card.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030303] to-transparent" />
    </section>
  )
}
