'use client'
import { motion } from 'framer-motion'

const problems = [
  { icon: '📵', text: 'Missed calls while on the job' },
  { icon: '💸', text: 'Lost leads to faster competitors' },
  { icon: '😤', text: 'Customers give up and call someone else' },
  { icon: '🌙', text: 'No one answering after hours' },
]

const solutions = [
  { icon: '✅', text: 'AI answers every call instantly' },
  { icon: '📋', text: 'Collects name, issue, postcode & phone' },
  { icon: '📲', text: 'Sends you an SMS & email immediately' },
  { icon: '🕐', text: 'Works 24/7 — even while you sleep' },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

const itemVariantsRight = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function ProblemSolution() {
  return (
    <section className="bg-[#030303] py-32">
      <div className="mx-auto max-w-6xl px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 text-center"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-400">The problem</p>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Plumbers lose{' '}
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              thousands
            </span>{' '}
            every month
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            While you're under a sink fixing a leak, your phone rings. You can't answer.
            That caller books your competitor instead.
          </p>
        </motion.div>

        {/* Problem / Solution grid */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Problems */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="rounded-3xl border border-red-500/10 bg-red-500/5 p-8"
          >
            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-red-400">Without TradeFlow AI</p>
            <div className="flex flex-col gap-4">
              {problems.map((p, i) => (
                <motion.div key={i} variants={itemVariants} className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-xl">
                    {p.icon}
                  </span>
                  <p className="text-zinc-300">{p.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Solutions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="rounded-3xl border border-blue-500/10 bg-blue-500/5 p-8"
          >
            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-blue-400">With TradeFlow AI</p>
            <div className="flex flex-col gap-4">
              {solutions.map((s, i) => (
                <motion.div key={i} variants={itemVariantsRight} className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                    {s.icon}
                  </span>
                  <p className="text-zinc-300">{s.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
