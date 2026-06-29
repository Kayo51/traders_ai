'use client'
import { motion } from 'framer-motion'

const features = [
  {
    icon: '🕐',
    title: '24/7 AI Receptionist',
    description: 'Your AI answers every call day and night, even on bank holidays — no salary, no sick days.',
    gradient: 'from-blue-500/10 to-blue-600/5',
    border: 'border-blue-500/15',
    iconBg: 'bg-blue-500/15',
  },
  {
    icon: '📋',
    title: 'Smart Lead Capture',
    description: 'Collects caller name, phone number, postcode, and job description in a natural conversation.',
    gradient: 'from-violet-500/10 to-violet-600/5',
    border: 'border-violet-500/15',
    iconBg: 'bg-violet-500/15',
  },
  {
    icon: '📲',
    title: 'Instant SMS Alerts',
    description: 'The moment a call ends, you get a full lead summary straight to your mobile via SMS.',
    gradient: 'from-emerald-500/10 to-emerald-600/5',
    border: 'border-emerald-500/15',
    iconBg: 'bg-emerald-500/15',
  },
  {
    icon: '📧',
    title: 'Email Notifications',
    description: 'Every lead is also emailed to you with all collected details, archived for follow-up.',
    gradient: 'from-cyan-500/10 to-cyan-600/5',
    border: 'border-cyan-500/15',
    iconBg: 'bg-cyan-500/15',
  },
  {
    icon: '📊',
    title: 'Leads Dashboard',
    description: 'View all your leads and calls in one place. Track status, postcode, and job type at a glance.',
    gradient: 'from-orange-500/10 to-orange-600/5',
    border: 'border-orange-500/15',
    iconBg: 'bg-orange-500/15',
  },
  {
    icon: '🔧',
    title: 'Built for Plumbers',
    description: 'Trained on UK plumbing terminology. Understands boiler repairs, leaks, and emergency call-outs.',
    gradient: 'from-pink-500/10 to-pink-600/5',
    border: 'border-pink-500/15',
    iconBg: 'bg-pink-500/15',
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function Features() {
  return (
    <section className="relative bg-[#030303] py-32 overflow-hidden">
      {/* Ambient */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/5 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-400">Everything you need</p>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            One tool.{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Zero missed leads.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            TradeFlow AI is built specifically for UK trade businesses — no generic AI, no bloated CRM.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`group relative rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.gradient} p-6 backdrop-blur-sm cursor-default`}
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconBg} text-2xl`}>
                {feature.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
