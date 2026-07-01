'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Period } from '@/lib/dashboardStats'

const OPTIONS: { value: Period; label: string }[] = [
  { value: 'day',   label: 'Today' },
  { value: 'week',  label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year',  label: 'Year' },
]

export function KPIPeriodFilter({ current }: { current: Period }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function select(p: Period) {
    const params = new URLSearchParams(searchParams.toString())
    if (p === 'day') params.delete('kpi_period')
    else params.set('kpi_period', p)
    router.replace(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
      {OPTIONS.map(o => (
        <button
          key={o.value}
          onClick={() => select(o.value)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
            current === o.value
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-300 hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
