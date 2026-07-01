'use client'

import { motion } from 'framer-motion'

type Accent = 'blue' | 'amber' | 'green' | 'red'

export type KPICardProps = {
  index: number
  title: string
  value: number
  icon: 'phone' | 'sparkles' | 'message-circle' | 'calendar'
  accent: Accent
  trend?: { pct: number; up: boolean; label: string }
  badge?: string
  progress?: { done: number; total: number }
  revenue?: string
}

const ACCENT: Record<Accent, { iconBg: string; iconText: string; via: string }> = {
  blue:  { iconBg: 'bg-blue-500/10',    iconText: 'text-blue-400',    via: 'via-blue-500/25' },
  amber: { iconBg: 'bg-amber-500/10',   iconText: 'text-amber-400',   via: 'via-amber-500/25' },
  green: { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-400', via: 'via-emerald-500/25' },
  red:   { iconBg: 'bg-red-500/10',     iconText: 'text-red-400',     via: 'via-red-500/25' },
}

function CardIcon({ type, className }: { type: KPICardProps['icon']; className: string }) {
  if (type === 'phone') return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  )
  if (type === 'sparkles') return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  )
  if (type === 'message-circle') return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  )
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )
}

export function KPICard({ index, title, value, icon, accent, trend, badge, progress, revenue }: KPICardProps) {
  const a = ACCENT[accent]
  const pct = progress && progress.total > 0 ? (progress.done / progress.total) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, y: -3, transition: { duration: 0.18, ease: 'easeOut' } }}
      className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-xl shadow-black/30 cursor-default select-none"
    >
      {/* Top accent line */}
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${a.via} to-transparent`} />

      {/* Icon + badge row */}
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconBg}`}>
          <CardIcon type={icon} className={`h-5 w-5 ${a.iconText}`} />
        </div>
        {badge && (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-amber-400 ring-1 ring-inset ring-amber-500/20">
            {badge}
          </span>
        )}
      </div>

      {/* Metric */}
      <div className="mt-4">
        <p className="text-[13px] font-medium text-zinc-500">{title}</p>
        <motion.p
          key={value}
          initial={{ opacity: 0.5, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="mt-1 text-3xl font-bold tracking-tight text-white"
        >
          {value}
        </motion.p>
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-col gap-2">
        {trend && (
          <div className={`flex items-center gap-1.5 text-xs font-medium ${trend.up ? 'text-emerald-400' : 'text-red-400'}`}>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              {trend.up
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941" />
              }
            </svg>
            {trend.up ? '+' : '-'}{trend.pct}% from {trend.label}
          </div>
        )}

        {progress && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">{progress.done} of {progress.total} contacted</span>
              <span className="font-medium text-zinc-400">{Math.round(pct)}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, delay: index * 0.08 + 0.35, ease: 'easeOut' }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
          </div>
        )}

        {revenue && (
          <p className="text-[11px] text-zinc-500">
            Est. revenue <span className="font-semibold text-emerald-400">{revenue}</span>
          </p>
        )}

      </div>
    </motion.div>
  )
}
