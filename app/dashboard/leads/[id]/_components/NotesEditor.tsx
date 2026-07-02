'use client'
import { useState, useTransition } from 'react'
import { updateLeadNotes } from '../actions'

export function NotesEditor({ leadId, initialNotes }: { leadId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      await updateLeadNotes(leadId, notes)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={notes}
        onChange={e => { setNotes(e.target.value); setSaved(false) }}
        rows={3}
        placeholder="Add private notes about this lead…"
        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none"
      />
      <button
        onClick={handleSave}
        disabled={pending}
        className="self-end rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
      >
        {saved ? 'Saved ✓' : pending ? 'Saving…' : 'Save notes'}
      </button>
    </div>
  )
}
