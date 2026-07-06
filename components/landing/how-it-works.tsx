'use client'
import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    icon: '📞',
    title: 'Customer calls your number',
    description: 'Your Twilio number forwards every inbound call directly to your JobBell receptionist — no hold music, no voicemail.',
    accent: 'from-blue-500 to-blue-600',
    glow: 'bg-blue-500/20',
  },
  {
    number: '02',
    icon: '🤖',
    title: 'AI answers instantly',
    description: 'Your AI receptionist greets the caller by name, sounds natural, and never gets it wrong. Available every single hour of every day.',
    accent: 'from-violet-500 to-violet-600',
    glow: 'bg-violet-500/20',
  },
  {
    number: '03',
    icon: '📋',
    title: 'Collects all job details',
    description: 'The AI gathers the caller\'s name, phone number, postcode, and a full description of the issue — conversationally, not like a robot.',
    accent: 'from-blue-400 to-cyan-500',
    glow: 'bg-cyan-500/20',
  },
  {
    number: '04',
    icon: '📲',
    title: 'You get an instant SMS + email',
    description: 'The moment the call ends, you get a full lead summary by SMS and email. Reply when you\'re ready — the lead is secured.',
    accent: 'from-emerald-500 to-teal-500',
    glow: 'bg-emerald-500/20',
  },
]

export default function HowItWorks() {
  return (
    <section className="relative bg-[#030303] py-32 overflow-hidden">
      {/* Ambient */}
      <div className="pointer-events-none absolute right-0 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-violet-600/5 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 text-center"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-400">How it works</p>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Up and running in{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              minutes
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            No complex setup. Connect your number, configure your preferences, and your AI receptionist is live.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative mx-auto max-w-3xl">
          {/* Vertical line */}
          <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-blue-500/50 via-violet-500/30 to-transparent lg:left-1/2" />

          <div className="flex flex-col gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative flex gap-6 lg:gap-0"
              >
                {/* Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.accent} shadow-lg`}>
                    <span className="text-2xl">{step.icon}</span>
                    <div className={`absolute -inset-2 rounded-3xl ${step.glow} blur-md`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2 lg:ml-8">
                  <span className="text-xs font-bold text-zinc-600">{step.number}</span>
                  <h3 className="mt-1 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-zinc-400 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
