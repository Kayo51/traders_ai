'use client'
import { useState, useRef } from 'react'

function VolumeIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.536 8.464a5 5 0 0 1 0 7.072M12 6l-4 4H5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h3l4 4V6Z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M18.364 5.636a9 9 0 0 1 0 12.728" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

type State = 'idle' | 'loading' | 'playing' | 'error'

export function VoicePreviewButton() {
  const [state, setState] = useState<State>('idle')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  async function handlePreview() {
    // Stop any currently playing audio first
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    setState('loading')
    setErrMsg(null)

    try {
      const greeting       = (document.querySelector('[name="greetingMessage"]') as HTMLTextAreaElement)?.value?.trim()
      const genderEl       = document.querySelector('[name="receptionistGender"]:checked') as HTMLInputElement | null
      const gender         = genderEl?.value ?? null
      const accent         = (document.querySelector('[name="receptionistAccent"]') as HTMLSelectElement)?.value ?? null
      const businessName   = (document.querySelector('[name="businessName"]') as HTMLInputElement)?.value?.trim() ?? null
      const receptionistName = (document.querySelector('[name="receptionistName"]') as HTMLInputElement)?.value?.trim() ?? null

      const res = await fetch('/api/preview-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ greeting, gender, accent, businessName, receptionistName }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Error ${res.status}`)
      }

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio

      audio.onended = () => {
        URL.revokeObjectURL(url)
        audioRef.current = null
        setState('idle')
      }

      await audio.play()
      setState('playing')
    } catch (e) {
      console.error('[preview-voice]', e)
      setErrMsg(e instanceof Error ? e.message : 'Preview failed')
      setState('error')
    }
  }

  const disabled = state === 'loading' || state === 'playing'

  const label =
    state === 'loading' ? 'Generating…' :
    state === 'playing' ? 'Playing…' :
    state === 'error'   ? 'Retry preview' :
    'Preview voice'

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handlePreview}
        disabled={disabled}
        title="Preview how your receptionist sounds"
        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === 'loading' || state === 'playing' ? <SpinnerIcon /> : <VolumeIcon />}
        {label}
      </button>
      {state === 'error' && errMsg && (
        <p className="text-[11px] text-red-500 max-w-[220px] text-right leading-tight">{errMsg}</p>
      )}
    </div>
  )
}
