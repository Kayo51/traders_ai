'use client'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const raw = useMotionValue(0)
  const spring = useSpring(raw, { stiffness: 60, damping: 18 })
  const display = useTransform(spring, (v) => `${Math.floor(v).toLocaleString('en-GB')}${suffix}`)

  useEffect(() => {
    if (isInView) raw.set(target)
  }, [isInView, raw, target])

  return <motion.span ref={ref}>{display}</motion.span>
}

const stats = [
  { value: 10000, suffix: '+', label: 'Calls handled', color: 'text-blue-400' },
  { value: 3200, suffix: '+', label: 'Leads captured', color: 'text-violet-400' },
  { value: 2, suffix: 's', label: 'Avg response time', color: 'text-emerald-400' },
  { value: 98, suffix: '%', label: 'Call answer rate', color: 'text-cyan-400' },
]

export default function Stats() {
  return (
    <section className="relative bg-[#030303] py-24 overflow-hidden">
      {/* Divider glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 gap-8 lg:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className={`text-4xl font-bold tracking-tight sm:text-5xl ${stat.color}`}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
