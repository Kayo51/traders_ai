'use client'

import { useTransition } from 'react'
import { deleteLead } from '../actions'

export function DeleteLeadButton({ leadId }: { leadId: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Permanently delete this lead and all associated data? This cannot be undone.')) return
    startTransition(() => deleteLead(leadId))
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {pending ? 'Deleting…' : 'Delete lead'}
    </button>
  )
}
