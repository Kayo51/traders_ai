import { getCurrentBusiness } from '@/lib/onboarding'
import db from '@/lib/db'
import { UrgencyBadge } from '@/components/ui/urgency-badge'
import { CallStatusCell } from './_components/call-status-cell'

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDate(date: Date) {
  return date.toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function CallsPage() {
  const business = await getCurrentBusiness()
  const calls = business
    ? await db.call.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: 'desc' },
        include: { lead: true },
      })
    : []

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Calls</h1>
        <p className="mt-1 text-sm text-zinc-500">All inbound calls handled by your AI receptionist.</p>
      </div>

      {calls.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <p className="text-sm font-medium text-zinc-900">No calls yet</p>
          <p className="mt-1 text-sm text-zinc-500">Calls will appear here once your Twilio number is active.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Caller</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Lead name</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Urgency</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Duration</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {calls.map(call => (
                <tr key={call.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-zinc-600">{call.callerPhone}</td>
                  <td className="px-4 py-3 text-zinc-900">{call.lead?.callerName ?? '—'}</td>
                  <td className="px-4 py-3">
                    {call.lead ? <UrgencyBadge urgency={call.lead.urgency} /> : <span className="text-zinc-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{formatDuration(call.durationSeconds)}</td>
                  <td className="px-4 py-3">
                    <CallStatusCell callId={call.id} initialStatus={call.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{formatDate(call.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
