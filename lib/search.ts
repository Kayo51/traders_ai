import { useMemo, useState, useRef, useCallback } from 'react'
import type { Lead } from '@prisma/client'

export function filterLeads(leads: Lead[], query: string): Lead[] {
  const q = query.trim().toLowerCase()
  if (!q) return leads
  return leads.filter(
    (lead) =>
      lead.callerName?.toLowerCase().includes(q) ||
      lead.callerPhone.toLowerCase().includes(q) ||
      lead.postcode?.toLowerCase().includes(q) ||
      lead.description?.toLowerCase().includes(q) ||
      lead.jobType?.toLowerCase().includes(q) ||
      lead.status.toLowerCase().replace('_', ' ').includes(q)
  )
}

export function useLeadSearch(leads: Lead[]) {
  const [query, setQuery] = useState('')
  const [applied, setApplied] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback((q: string) => {
    setQuery(q)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setApplied(q), 250)
  }, [])

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setQuery('')
    setApplied('')
  }, [])

  const filtered = useMemo(() => filterLeads(leads, applied), [leads, applied])

  return {
    query,
    handleChange,
    clear,
    filtered,
    hasQuery: applied.trim().length > 0,
    resultCount: filtered.length,
  }
}
