'use client'

import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import type { Lead } from '@prisma/client'
import { LeadRow } from './lead-row'
import { useLeadSearch } from '@/lib/search'
import { DashboardSearch } from '@/components/dashboard/DashboardSearch'

// Status filter options
const LEAD_STATUSES = ['ALL', 'NEW', 'CONTACTED', 'BOOKED', 'COMPLETED', 'LOST']

// Column definitions for sortable headers
const COLUMNS = [
  { key: 'urgency',     label: 'Urgency' },
  { key: 'callerName',  label: 'Name' },
  { key: 'description', label: 'Issue' },
  { key: 'postcode',    label: 'Postcode' },
  { key: 'callerPhone', label: 'Phone' },
  { key: 'status',      label: 'Status' },
  { key: 'action',      label: 'Action',   noSort: true },
  { key: 'createdAt',   label: 'Received' },
  { key: 'delete',      label: '',          noSort: true },
]

// Time grouping helpers (same logic as before)
function startOfDay(d: Date) { const r = new Date(d); r.setHours(0,0,0,0); return r }
function subDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate()-n); return r }

function groupLeads(leads: Lead[]) {
  const now = new Date()
  const todayStart = startOfDay(now)
  const groups = [
    { label: 'Today',         leads: [] as Lead[], from: todayStart },
    { label: 'Yesterday',     leads: [] as Lead[], from: subDays(todayStart,1) },
    { label: 'Last 48 Hours', leads: [] as Lead[], from: subDays(todayStart,2) },
    { label: 'Last 7 Days',   leads: [] as Lead[], from: subDays(todayStart,7) },
    { label: 'This Month',    leads: [] as Lead[], from: new Date(now.getFullYear(), now.getMonth(), 1) },
    { label: 'Older Leads',   leads: [] as Lead[], from: new Date(0) },
  ]
  for (const lead of leads) {
    const t = lead.createdAt.getTime()
    if      (t >= groups[0].from.getTime()) groups[0].leads.push(lead)
    else if (t >= groups[1].from.getTime()) groups[1].leads.push(lead)
    else if (t >= groups[2].from.getTime()) groups[2].leads.push(lead)
    else if (t >= groups[3].from.getTime()) groups[3].leads.push(lead)
    else if (t >= groups[4].from.getTime()) groups[4].leads.push(lead)
    else groups[5].leads.push(lead)
  }
  return groups.filter(g => g.leads.length > 0)
}

export function LeadsTable({ leads, currentSort, currentDir, currentStatus }: {
  leads: Lead[]
  currentSort: string
  currentDir: 'asc' | 'desc'
  currentStatus: string
}) {
  const router = useRouter()
  const { query, handleChange, clear, filtered, hasQuery, resultCount } = useLeadSearch(leads)

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

  // Show grouped view only when sorting by createdAt or not sorting — and not actively searching
  const showGrouped = (!currentSort || currentSort === 'createdAt') && !hasQuery

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

  const tableHeader = (
    <thead>
      <tr className="border-b border-zinc-100 bg-zinc-50">
        {COLUMNS.map(col => (
          <th key={col.key} className={`px-4 py-3 text-left font-medium text-zinc-500 ${!col.noSort ? 'cursor-pointer select-none group' : ''}`}
            onClick={col.noSort ? undefined : () => handleSort(col.key)}>
            <span className="inline-flex items-center gap-1.5">
              {col.label}
              {!col.noSort && sortIndicator(col.key)}
            </span>
          </th>
        ))}
      </tr>
    </thead>
  )

  const renderRows = (rows: Lead[]) => rows.map(lead => (
    <LeadRow
      key={lead.id}
      id={lead.id}
      callerName={lead.callerName}
      callerPhone={lead.callerPhone}
      description={lead.description}
      jobType={lead.jobType}
      postcode={lead.postcode}
      urgency={lead.urgency}
      status={lead.status}
      contacted={lead.contacted}
      contactedAt={lead.contactedAt}
      followUpCount={lead.followUpCount}
      followUpStopped={lead.followUpStopped}
      nextFollowUpAt={lead.nextFollowUpAt}
      createdAt={lead.createdAt}
    />
  ))

  const grouped = showGrouped ? groupLeads(filtered) : null

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <DashboardSearch
        value={query}
        onChange={handleChange}
        onClear={clear}
        resultCount={resultCount}
        hasQuery={hasQuery}
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {LEAD_STATUSES.map(s => {
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
        {(currentSort || currentStatus) && (
          <button onClick={() => router.push('?')}
            className="ml-auto text-xs text-zinc-400 hover:text-zinc-700 underline">
            Clear filters
          </button>
        )}
      </div>

      {hasQuery && resultCount === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <p className="text-sm font-medium text-zinc-900">No results found</p>
          <p className="mt-1 text-sm text-zinc-500">Try a name, phone number, postcode or job type.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <p className="text-sm font-medium text-zinc-900">No leads match these filters</p>
          <p className="mt-1 text-sm text-zinc-500">Try a different status or clear the filters.</p>
        </div>
      ) : showGrouped ? (
        /* Grouped view */
        <div className="flex flex-col gap-8">
          {grouped!.map(group => (
            <div key={group.label}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">{group.label}</h2>
              <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
                <table className="w-full min-w-[640px] text-sm">
                  {tableHeader}
                  <tbody className="divide-y divide-zinc-100">{renderRows(group.leads)}</tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Flat sorted / search results view */
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            {tableHeader}
            <tbody className="divide-y divide-zinc-100">{renderRows(filtered)}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
