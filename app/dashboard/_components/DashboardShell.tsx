'use client'
import { useState } from 'react'

export function DashboardShell({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-zinc-50">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-zinc-800 bg-zinc-900 transition-transform duration-200
          sm:static sm:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {sidebar}
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-y-auto min-w-0">
        {/* Mobile header */}
        <div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3 sm:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 transition-colors"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-zinc-900">JobBell</span>
        </div>
        {children}
      </main>
    </div>
  )
}
