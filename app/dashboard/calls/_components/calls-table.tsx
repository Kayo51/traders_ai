'use client'

import { useRouter } from 'next/navigation'
import type { Call, Lead } from '@prisma/client'
import { CallRow } from './call-row'



type CallWithLead = Call & { lead: Lead | null }

const CALL_STATUSES = ['ALL', 'COMPLETED', 'IN_PROGRESS', 'NO_ANSWER', 'FAILED', 'VOICEMAIL']

const COLUMNS = [
  { key: 'callerPhone',     label: 'Caller' },
  { key: 'leadName',        label: 'Lead name' },
  { key: 'urgency',         label: 'Urgency' },
  { key: 'durationSeconds', label: 'Duration' },
  { key: 'status',          label: 'Status' },
  { key: 'createdAt',       label: 'Date' },
  { key: 'delete',          label: '' },
]


export function CallsTable({ calls, currentSort, currentDir, currentStatus }: {
  calls: CallWithLead[]
  currentSort: string
  currentDir: 'asc' | 'desc'
  currentStatus: string
}) {
  const router = useRouter()

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) params.delete(k)
      else params.set(k, v)
    }
    router.push(`?${params.toString()}`)
  }

  function handleSort(key: string) {
    if (currentSort === key) {
      if (currentDir === 'asc') updateParams({ sort: key, dir: 'desc' })
      else updateParams({ sort: null, dir: null })
    } else {
      updateParams({ sort: key, dir: 'asc' })
    }
  }

  function handleStatus(s: string) {
    updateParams({ status: s === 'ALL' ? null : s })
  }

  const sortIndicator = (key: string) => {
    if (currentSort !== key) return (
      <svg className="h-3 w-3 text-zinc-300 group-hover:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    )
    return currentDir === 'asc'
      ? <svg className="h-3 w-3 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
      : <svg className="h-3 w-3 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {CALL_STATUSES.map(s => {
          const active = s === (currentStatus || 'ALL')
          return (
            <button key={s}
              onClick={() => handleStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}>
              {s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
            </button>
          )
        })}
        {(currentSort || (currentStatus && currentStatus !== 'ALL')) && (
          <button onClick={() => router.push('?')}
            className="ml-auto text-xs text-zinc-400 hover:text-zinc-700 underline">
            Clear filters
          </button>
        )}
      </div>

      {calls.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <p className="text-sm font-medium text-zinc-900">No calls match these filters</p>
          <p className="mt-1 text-sm text-zinc-500">Try a different status or clear the filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                {COLUMNS.map(col => (
                  <th key={col.key}
                    className="px-4 py-3 text-left font-medium text-zinc-500 cursor-pointer select-none group"
                    onClick={() => handleSort(col.key)}>
                    <span className="inline-flex items-center gap-1.5">
                      {col.label}
                      {sortIndicator(col.key)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {calls.map(call => (
                <CallRow key={call.id} call={call} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
