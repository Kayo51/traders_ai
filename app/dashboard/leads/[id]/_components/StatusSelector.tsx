'use client'
import { useState, useTransition } from 'react'
import { updateLeadStatus } from '../actions'
import type { LeadStatus } from '@prisma/client'

const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'BOOKED', 'COMPLETED', 'LOST']

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW:       'bg-blue-50 text-blue-700 border-blue-200',
  CONTACTED: 'bg-green-50 text-green-700 border-green-200',
  BOOKED:    'bg-purple-50 text-purple-700 border-purple-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  LOST:      'bg-zinc-100 text-zinc-500 border-zinc-200',
}

export function StatusSelector({ leadId, current }: { leadId: string; current: LeadStatus }) {
  const [status, setStatus] = useState<LeadStatus>(current)
  const [pending, startTransition] = useTransition()

  function handleChange(s: LeadStatus) {
    setStatus(s)
    startTransition(() => updateLeadStatus(leadId, s))
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map(s => (
        <button
          key={s}
          onClick={() => handleChange(s)}
          disabled={pending}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
            status === s
              ? STATUS_STYLES[s]
              : 'border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-600'
          }`}
        >
          {s.charAt(0) + s.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
  )
}
