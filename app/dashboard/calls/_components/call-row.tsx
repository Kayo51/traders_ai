'use client'
import { useState } from 'react'
import type { Call, Lead } from '@prisma/client'
import { UrgencyBadge } from '@/components/ui/urgency-badge'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { CallStatusCell } from './call-status-cell'
import { deleteCall } from '../actions'

type CallWithLead = Call & { lead: Lead | null }

function formatDuration(s: number | null) {
  if (!s) return '—'
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
function formatDate(d: Date) {
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function CallRow({ call }: { call: CallWithLead }) {
  const [deleted, setDeleted] = useState(false)
  if (deleted) return null

  return (
    <tr className="hover:bg-zinc-50 transition-colors">
      <td className="px-4 py-3 font-mono text-zinc-600 text-xs">{call.callerPhone}</td>
      <td className="px-4 py-3 text-zinc-900">{call.lead?.callerName ?? '—'}</td>
      <td className="px-4 py-3">
        {call.lead ? <UrgencyBadge urgency={call.lead.urgency} /> : <span className="text-zinc-400">—</span>}
      </td>
      <td className="px-4 py-3 text-zinc-600">{formatDuration(call.durationSeconds)}</td>
      <td className="px-4 py-3">
        <CallStatusCell callId={call.id} initialStatus={call.status} />
      </td>
      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap text-xs">{formatDate(call.createdAt)}</td>
      <td className="px-4 py-3">
        <DeleteButton onDelete={async () => { await deleteCall(call.id); setDeleted(true) }} />
      </td>
    </tr>
  )
}
