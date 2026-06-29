'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Urgency, LeadStatus } from '@prisma/client'
import { UrgencyBadge } from '@/components/ui/urgency-badge'
import { markAsContacted, undoContacted } from '../actions'

type LeadRowProps = {
  id: string
  callerName: string | null
  callerPhone: string
  description: string | null
  jobType: string | null
  postcode: string | null
  urgency: Urgency
  status: LeadStatus
  contacted: boolean
  contactedAt: Date | null
  followUpCount: number
  followUpStopped: boolean
  nextFollowUpAt: Date | null
  createdAt: Date
}

function formatDate(date: Date) {
  return date.toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatRelative(date: Date): string {
  const diff = date.getTime() - Date.now()
  if (diff <= 0) return 'overdue'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const STATUS_STYLES: Partial<Record<LeadStatus, string>> = {
  NEW: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  CONTACTED: 'bg-green-50 text-green-700 ring-green-600/20',
  BOOKED: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  COMPLETED: 'bg-green-50 text-green-700 ring-green-600/20',
  LOST: 'bg-zinc-100 text-zinc-500 ring-zinc-500/20',
}

export function LeadRow(props: LeadRowProps) {
  const [contacted, setContacted] = useState(props.contacted)
  const [contactedAt, setContactedAt] = useState(props.contactedAt)
  const [showUndo, setShowUndo] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!showUndo) return
    const t = setTimeout(() => setShowUndo(false), 6000)
    return () => clearTimeout(t)
  }, [showUndo])

  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 4000)
    return () => clearTimeout(t)
  }, [showToast])

  function handleMarkContacted() {
    setContacted(true)
    setContactedAt(new Date())
    setShowUndo(true)
    setShowToast(true)
    startTransition(() => markAsContacted(props.id))
  }

  function handleUndo() {
    setContacted(false)
    setContactedAt(null)
    setShowUndo(false)
    setShowToast(false)
    startTransition(() => undoContacted(props.id))
  }

  const followUpLabel = (() => {
    if (contacted || props.followUpStopped) return null
    if (props.nextFollowUpAt) {
      return `Next: ${formatRelative(props.nextFollowUpAt)}`
    }
    return null
  })()

  return (
    <>
      <tr className="hover:bg-zinc-50 transition-colors">
        <td className="px-4 py-3">
          <UrgencyBadge urgency={props.urgency} />
        </td>
        <td className="px-4 py-3 font-medium text-zinc-900">{props.callerName ?? '—'}</td>
        <td className="px-4 py-3 text-zinc-600 max-w-xs truncate">
          {props.description ?? props.jobType ?? '—'}
        </td>
        <td className="px-4 py-3 font-mono text-zinc-600 text-xs">{props.postcode ?? '—'}</td>
        <td className="px-4 py-3 text-zinc-600 text-xs">{props.callerPhone}</td>
        <td className="px-4 py-3">
          <div className="flex flex-col gap-1">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[contacted ? 'CONTACTED' : props.status] ?? 'bg-zinc-100 text-zinc-500 ring-zinc-500/20'}`}>
              {contacted ? 'Contacted' : props.status}
            </span>
            {followUpLabel && (
              <span className="text-[10px] text-zinc-400">{followUpLabel}</span>
            )}
            {props.followUpCount > 0 && (
              <span className="text-[10px] text-zinc-400">{props.followUpCount} sent</span>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <AnimatePresence mode="wait">
            {contacted ? (
              <motion.div
                key="contacted"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-1"
              >
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Contacted ✓
                </span>
                {contactedAt && (
                  <span className="text-[10px] text-zinc-400">{formatDate(contactedAt)}</span>
                )}
                {showUndo && (
                  <button
                    onClick={handleUndo}
                    className="text-[10px] text-blue-500 hover:text-blue-700 underline"
                  >
                    Undo
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.button
                key="mark"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleMarkContacted}
                disabled={isPending}
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                Mark as Contacted
              </motion.button>
            )}
          </AnimatePresence>
        </td>
        <td className="px-4 py-3 text-zinc-500 whitespace-nowrap text-xs">{formatDate(props.createdAt)}</td>
      </tr>

      {/* Toast — portalled to body to avoid invalid <div> inside <tbody> */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-zinc-900 px-4 py-3 shadow-xl"
            >
              <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium text-white">Lead marked as contacted</span>
              <button onClick={handleUndo} className="ml-2 text-xs text-zinc-400 hover:text-white underline">
                Undo
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
