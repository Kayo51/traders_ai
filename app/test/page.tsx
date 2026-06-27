'use client'
import { useState, useRef, useEffect } from 'react'
import type { Message, CollectedLead } from '@/lib/ai/receptionist'

type ChatMessage = Message & { id: number }

export default function TestPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lead, setLead] = useState<CollectedLead | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)

  const nextId = () => ++idRef.current

  async function sendMessage(userText?: string) {
    if (loading) return

    const outgoing: Message[] = userText
      ? [...messages.map(({ role, content }) => ({ role, content })), { role: 'user' as const, content: userText }]
      : []

    const optimistic: ChatMessage[] = userText
      ? [...messages, { id: nextId(), role: 'user' as const, content: userText }]
      : messages

    if (userText) setMessages(optimistic)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/receptionist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: outgoing }),
      })
      const data = await res.json()

      if (data.error) {
        setMessages(prev => [...prev, { id: nextId(), role: 'assistant', content: `Error: ${data.error}` }])
        return
      }

      setMessages(prev => [...prev, { id: nextId(), role: 'assistant', content: data.reply }])

      if (data.complete) setLead(data.lead)
    } finally {
      setLoading(false)
    }
  }

  // Trigger initial greeting on mount
  useEffect(() => { sendMessage() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-xl flex flex-col gap-6">

        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">AI Receptionist — Test</h1>
          <span className="text-xs text-zinc-500 font-mono">POST /api/receptionist/chat</span>
        </div>

        {/* Chat window */}
        <div className="flex flex-col gap-3 min-h-[300px] max-h-[500px] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-2xl px-4 py-2 text-sm max-w-[80%] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-zinc-700 text-zinc-100 rounded-br-sm'
                    : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 text-zinc-400 rounded-2xl rounded-bl-sm px-4 py-2 text-sm">
                <span className="animate-pulse">···</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Lead output */}
        {lead && (
          <div className="rounded-xl border border-emerald-800 bg-emerald-950 p-4">
            <p className="text-xs font-semibold text-emerald-400 mb-2 tracking-wide uppercase">Lead collected</p>
            <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap">
              {JSON.stringify(lead, null, 2)}
            </pre>
          </div>
        )}

        {/* Input */}
        {!lead && (
          <form
            onSubmit={e => { e.preventDefault(); if (input.trim()) sendMessage(input.trim()) }}
            className="flex gap-2"
          >
            <input
              className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              placeholder="Type your reply…"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-40 transition-colors"
            >
              Send
            </button>
          </form>
        )}

        {lead && (
          <button
            onClick={() => { setMessages([]); setLead(null); sendMessage() }}
            className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-colors"
          >
            Start new conversation
          </button>
        )}
      </div>
    </div>
  )
}
