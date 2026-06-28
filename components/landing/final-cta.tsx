'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function FinalCTA() {
  return (
    <section className="relative bg-[#030303] py-32 overflow-hidden">
      {/* Deep glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[100px]" />
      </div>

      {/* Top divider */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            <span className="text-xs font-medium tracking-wide text-blue-300">
              Start capturing leads tonight
            </span>
          </div>

          <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Every missed call is a{' '}
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">
              missed job
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            Set up in minutes. No contracts, no hardware, no tech knowledge needed.
            Your AI receptionist answers the first call before you finish your tea.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-10 py-4 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-105"
            >
              Get started free
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border border-white/10 bg-white/5 px-10 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-6 text-xs text-zinc-600">
            No credit card required · Cancel anytime · UK-built for UK plumbers
          </p>
        </motion.div>
      </div>

      {/* Footer bar */}
      <div className="relative mx-auto mt-24 max-w-6xl border-t border-white/[0.06] px-6 pt-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm font-semibold text-white">TradeFlow AI</p>
          <p className="text-xs text-zinc-600">© 2026 TradeFlow AI. Built for UK plumbers.</p>
        </div>
      </div>
    </section>
  )
}
