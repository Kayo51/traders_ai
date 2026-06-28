'use client'
import { motion } from 'framer-motion'

const testimonials = [
  {
    quote: "I was losing 4-5 calls a day just because I couldn't answer while under a sink. TradeFlow AI sorted that in 10 minutes. Got 3 new jobs the first week.",
    name: 'Dave Hargreaves',
    role: 'Sole trader, Manchester',
    avatar: 'DH',
    color: 'from-blue-500 to-blue-600',
  },
  {
    quote: "Honestly thought it would sound robotic. Nope. My customers think they're talking to a real receptionist. Leads come in overnight now.",
    name: 'Priya Patel',
    role: 'Gas Safe engineer, Birmingham',
    avatar: 'PP',
    color: 'from-violet-500 to-violet-600',
  },
  {
    quote: "The SMS the second the call ends is brilliant. I'm on a job, I finish, I have the full lead waiting for me. No missed follow-ups anymore.",
    name: 'Tom Brennan',
    role: 'Plumbing & heating, London',
    avatar: 'TB',
    color: 'from-emerald-500 to-teal-500',
  },
]

export default function Testimonials() {
  return (
    <section className="relative bg-[#030303] py-32 overflow-hidden">
      {/* Ambient */}
      <div className="pointer-events-none absolute left-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-blue-600/5 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-400">Real results</p>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Plumbers who stopped{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              missing calls
            </span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col gap-6 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-sm"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, s) => (
                  <svg key={s} className="h-4 w-4 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="flex-1 text-sm leading-relaxed text-zinc-300">"{t.quote}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-xs font-bold text-white`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
