import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCurrentBusiness } from '@/lib/onboarding'
import db from '@/lib/db'
import { NotesEditor } from './_components/NotesEditor'
import { StatusSelector } from './_components/StatusSelector'

export const dynamic = 'force-dynamic'

type Message = { role: 'user' | 'assistant'; content: string }

const URGENCY_STYLES: Record<string, string> = {
  LOW:        'bg-zinc-100 text-zinc-600',
  MODERATE:   'bg-yellow-50 text-yellow-700',
  HIGH:       'bg-orange-50 text-orange-700',
  VERY_URGENT:'bg-red-50 text-red-700',
}

const STATUS_STYLES: Record<string, string> = {
  NEW:       'bg-blue-50 text-blue-700 ring-blue-600/20',
  CONTACTED: 'bg-green-50 text-green-700 ring-green-600/20',
  BOOKED:    'bg-purple-50 text-purple-700 ring-purple-600/20',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  LOST:      'bg-zinc-100 text-zinc-500 ring-zinc-500/20',
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function formatDate(d: Date): string {
  return d.toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const business = await getCurrentBusiness()
  if (!business) notFound()

  const lead = await db.lead.findUnique({
    where: { id, businessId: business.id },
    include: { call: { include: { conversation: true } } },
  })
  if (!lead) notFound()

  const messages = (lead.call?.conversation?.messages ?? []) as Message[]
  const hasTranscript = messages.length > 0

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8 flex flex-col gap-6">

      {/* Back */}
      <Link href="/dashboard/leads" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors w-fit">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        All Leads
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{lead.callerName ?? 'Unknown caller'}</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{lead.callerPhone}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${URGENCY_STYLES[lead.urgency] ?? ''}`}>
            {lead.urgency.replace('_', ' ')}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[lead.status] ?? ''}`}>
            {lead.status}
          </span>
        </div>
      </div>

      {/* Status + Notes (actions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col gap-3">
          <p className="text-xs font-semibold text-zinc-500">Update status</p>
          <StatusSelector leadId={lead.id} current={lead.status} />
        </section>
        <section className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col gap-3">
          <p className="text-xs font-semibold text-zinc-500">Notes</p>
          <NotesEditor leadId={lead.id} initialNotes={lead.notes ?? ''} />
        </section>
      </div>

      {/* Lead details */}
      <section className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-900">Lead details</h2>
        </div>
        {lead.jobType && (
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-zinc-500">Job type</span>
            <span className="text-sm text-zinc-900">{lead.jobType}</span>
          </div>
        )}
        {lead.description && (
          <div className="px-5 py-3">
            <p className="text-xs text-zinc-500 mb-1">Description</p>
            <p className="text-sm text-zinc-900">{lead.description}</p>
          </div>
        )}
        {lead.postcode && (
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-zinc-500">Postcode</span>
            <span className="text-sm font-mono text-zinc-900">{lead.postcode}</span>
          </div>
        )}
        {lead.address && (
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-zinc-500">Address</span>
            <span className="text-sm text-zinc-900 text-right">{lead.address}</span>
          </div>
        )}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-xs text-zinc-500">Received</span>
          <span className="text-sm text-zinc-900">{formatDate(lead.createdAt)}</span>
        </div>
        {lead.appointmentStart && (
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-zinc-500">Appointment</span>
            <span className="text-sm text-zinc-900">{formatDate(lead.appointmentStart)}</span>
          </div>
        )}
      </section>

      {/* Follow-up timeline */}
      <section className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-900">Follow-up timeline</h2>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          {lead.followUpCount === 0 ? (
            <p className="text-sm text-zinc-500">No follow-up messages sent yet.</p>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                {lead.followUpCount}
              </div>
              <div>
                <p className="text-sm text-zinc-900">{lead.followUpCount} follow-up {lead.followUpCount === 1 ? 'message' : 'messages'} sent</p>
                {lead.lastFollowUpAt && (
                  <p className="text-xs text-zinc-400">Last sent {formatDate(lead.lastFollowUpAt)}</p>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            {lead.followUpStopped || lead.contacted ? (
              <>
                <div className="h-2 w-2 rounded-full bg-zinc-300 shrink-0 ml-2.5" />
                <p className="text-sm text-zinc-500">
                  {lead.contacted ? 'Customer contacted — follow-ups stopped.' : 'Follow-ups stopped.'}
                </p>
              </>
            ) : lead.nextFollowUpAt ? (
              <>
                <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 ml-2.5" />
                <p className="text-sm text-zinc-700">Next message scheduled {formatDate(lead.nextFollowUpAt)}</p>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* Call details */}
      {lead.call && (
        <section className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          <div className="px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">Call details</h2>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-zinc-500">Duration</span>
            <span className="text-sm text-zinc-900">{formatDuration(lead.call.durationSeconds)}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-zinc-500">Date</span>
            <span className="text-sm text-zinc-900">{formatDate(lead.call.createdAt)}</span>
          </div>
          {lead.call.recordingUrl && (
            <div className="px-5 py-4">
              <p className="text-xs text-zinc-500 mb-2">Recording</p>
              <audio controls src={lead.call.recordingUrl} className="w-full h-10 rounded-lg" />
            </div>
          )}
        </section>
      )}

      {/* Transcript */}
      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900">Conversation transcript</h2>
          {hasTranscript && <p className="mt-0.5 text-xs text-zinc-500">{messages.length} messages</p>}
        </div>
        {hasTranscript ? (
          <div className="flex flex-col gap-3 p-5">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-medium text-zinc-400 px-1">
                    {msg.role === 'assistant' ? (business.receptionistName ?? 'TradeFlow AI') : (lead.callerName ?? 'Caller')}
                  </span>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-zinc-100 text-zinc-800 rounded-tl-sm'
                      : 'bg-zinc-900 text-white rounded-tr-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-zinc-500">No transcript available for this lead.</p>
          </div>
        )}
      </section>
    </div>
  )
}
