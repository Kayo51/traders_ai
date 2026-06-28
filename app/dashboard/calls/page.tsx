import db from '@/lib/db'
import { CallStatus } from '@prisma/client'

const STATUS_STYLES: Record<CallStatus, string> = {
  IN_PROGRESS: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  COMPLETED: 'bg-green-50 text-green-700 ring-green-600/20',
  FAILED: 'bg-red-50 text-red-700 ring-red-600/20',
  NO_ANSWER: 'bg-zinc-100 text-zinc-500 ring-zinc-500/20',
  VOICEMAIL: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDate(date: Date) {
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function CallsPage() {
  const businessId = process.env.DEV_BUSINESS_ID
  const calls = businessId
    ? await db.call.findMany({
        where: { businessId },
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
                  <td className="px-4 py-3 text-zinc-600">{formatDuration(call.durationSeconds)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[call.status]}`}>
                      {call.status.replace('_', ' ')}
                    </span>
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
