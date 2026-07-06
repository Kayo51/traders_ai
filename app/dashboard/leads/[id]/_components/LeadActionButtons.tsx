'use client'
import { useTransition, useState } from 'react'
import { sendOnMyWay, markLeadComplete, markQuoteSent } from '../actions'

type Props = {
  leadId: string
  status: string
  onMyWaySentAt: Date | null
  reviewRequestSentAt: Date | null
  quoteSentAt: Date | null
  hasGooglePlaceId: boolean
}

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function LeadActionButtons({ leadId, status, onMyWaySentAt, reviewRequestSentAt, quoteSentAt, hasGooglePlaceId }: Props) {
  const [pending, startTransition] = useTransition()
  const [toast, setToast] = useState<string | null>(null)

  const done = status === 'COMPLETED' || status === 'LOST'

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  function handleOnMyWay() {
    startTransition(async () => {
      const res = await sendOnMyWay(leadId)
      if ('error' in res) { showToast(`Error: ${res.error}`); return }
      showToast('SMS sent — customer notified you\'re on the way')
    })
  }

  function handleComplete() {
    if (!confirm('Mark this job as complete?' + (hasGooglePlaceId ? ' A Google review request will be sent.' : ''))) return
    startTransition(async () => {
      const res = await markLeadComplete(leadId)
      if ('error' in res) { showToast(`Error: ${res.error}`); return }
      showToast(res.reviewSent ? 'Job complete — review request sent to customer' : 'Job marked as complete')
    })
  }

  function handleQuoteSent() {
    startTransition(async () => {
      const res = await markQuoteSent(leadId)
      if ('error' in res) { showToast(`Error: ${res.error}`); return }
      showToast('Quote marked as sent — automatic follow-ups scheduled at day 3 and day 7')
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {toast && (
        <div className="rounded-lg bg-zinc-900 px-4 py-2.5 text-xs text-white font-medium">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {/* On My Way */}
        <button
          onClick={handleOnMyWay}
          disabled={pending || done}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
          </svg>
          On My Way
          {onMyWaySentAt && (
            <span className="opacity-70 font-normal">· {timeAgo(new Date(onMyWaySentAt))}</span>
          )}
        </button>

        {/* Quote Sent */}
        {!done && status !== 'QUOTED' && status !== 'BOOKED' && (
          <button
            onClick={handleQuoteSent}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
            </svg>
            Quote Sent
          </button>
        )}
        {quoteSentAt && (
          <span className="inline-flex items-center text-xs text-amber-600 font-medium">
            Quote sent {timeAgo(new Date(quoteSentAt))}
          </span>
        )}

        {/* Mark Complete */}
        {!done && (
          <button
            onClick={handleComplete}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
            Mark Complete
            {hasGooglePlaceId && <span className="opacity-70 font-normal">· review request</span>}
          </button>
        )}
        {reviewRequestSentAt && (
          <span className="inline-flex items-center text-xs text-emerald-600 font-medium">
            ★ Review request sent {timeAgo(new Date(reviewRequestSentAt))}
          </span>
        )}
      </div>
    </div>
  )
}
