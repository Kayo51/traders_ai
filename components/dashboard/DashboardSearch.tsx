'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  value: string
  onChange: (q: string) => void
  onClear: () => void
  resultCount: number
  hasQuery: boolean
}

export function DashboardSearch({ value, onChange, onClear, resultCount, hasQuery }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyboard = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    if (e.key === 'Escape' && document.activeElement === inputRef.current) {
      onClear()
      inputRef.current?.blur()
    }
  }, [onClear])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [handleKeyboard])

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <svg
          className="pointer-events-none absolute left-3.5 h-4 w-4 text-zinc-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Search customers, postcode, phone or job..."
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-32 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10"
        />

        <div className="absolute right-3 flex items-center gap-2">
          <AnimatePresence mode="wait">
            {hasQuery ? (
              <motion.button
                key="clear"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                onClick={onClear}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                <span className="font-medium">{resultCount} result{resultCount !== 1 ? 's' : ''}</span>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            ) : (
              <motion.div
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1"
              >
                <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                  ⌘K
                </kbd>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
