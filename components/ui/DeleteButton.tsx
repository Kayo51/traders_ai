'use client'
import { useState, useTransition } from 'react'

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

export function DeleteButton({ onDelete }: { onDelete: () => Promise<void> | void }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await onDelete()
    })
  }

  if (pending) {
    return <span className="text-[11px] text-zinc-400 px-1">Deleting…</span>
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1.5 whitespace-nowrap">
        <button
          onClick={handleDelete}
          className="text-[11px] font-semibold text-red-600 hover:text-red-800 transition-colors"
        >
          Delete
        </button>
        <span className="text-zinc-300 text-[11px]">·</span>
        <button
          onClick={() => setConfirming(false)}
          className="text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          Cancel
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Delete"
      className="text-zinc-300 hover:text-red-500 transition-colors rounded p-1 -m-1"
    >
      <TrashIcon />
    </button>
  )
}
