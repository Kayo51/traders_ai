'use client'

import { useState, useTransition } from 'react'
import type { CallStatus } from '@prisma/client'
import { updateCallStatus } from '../actions'

const STATUS_STYLES: Record<CallStatus, string> = {
  IN_PROGRESS: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  COMPLETED:   'bg-green-50 text-green-700 ring-green-600/20',
  FAILED:      'bg-red-50 text-red-700 ring-red-600/20',
  NO_ANSWER:   'bg-zinc-100 text-zinc-500 ring-zinc-500/20',
  VOICEMAIL:   'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
}

const ALL_STATUSES: CallStatus[] = ['COMPLETED', 'IN_PROGRESS', 'NO_ANSWER', 'FAILED', 'VOICEMAIL']

export function CallStatusCell({ callId, initialStatus }: { callId: string; initialStatus: CallStatus }) {
  const [status, setStatus] = useState<CallStatus>(initialStatus)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function choose(s: CallStatus) {
    setOpen(false)
    if (s === status) return
    setStatus(s)
    startTransition(() => updateCallStatus(callId, s))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={isPending}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 ${STATUS_STYLES[status]}`}
      >
        {status.replace('_', ' ')}
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-7 z-20 w-36 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
            {ALL_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => choose(s)}
                className={`flex w-full items-center px-3 py-1.5 text-xs hover:bg-zinc-50 ${s === status ? 'font-semibold text-zinc-900' : 'text-zinc-600'}`}
              >
                {s.replace('_', ' ')}
                {s === status && (
                  <svg className="ml-auto h-3 w-3 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
