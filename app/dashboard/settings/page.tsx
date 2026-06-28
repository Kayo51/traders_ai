import db from '@/lib/db'
import { saveSettings } from './actions'

export default async function SettingsPage() {
  const businessId = process.env.DEV_BUSINESS_ID
  const settings = businessId
    ? await db.businessSettings.findUnique({ where: { businessId } })
    : null

  const business = businessId
    ? await db.business.findUnique({ where: { id: businessId } })
    : null

  return (
    <div className="flex flex-col gap-8 p-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Configure how your AI receptionist behaves.</p>
      </div>

      <form action={saveSettings} className="flex flex-col gap-6">
        <section className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          <div className="px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">Business</h2>
          </div>

          <div className="flex flex-col gap-1 px-5 py-4">
            <label className="text-xs font-medium text-zinc-500">Business name</label>
            <p className="text-sm text-zinc-900">{business?.name ?? '—'}</p>
          </div>

          <div className="flex flex-col gap-1 px-5 py-4">
            <label htmlFor="greetingMessage" className="text-xs font-medium text-zinc-500">
              AI greeting message
            </label>
            <textarea
              id="greetingMessage"
              name="greetingMessage"
              rows={3}
              defaultValue={settings?.greetingMessage ?? ''}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none"
            />
            <p className="text-xs text-zinc-400">This is the first thing callers hear.</p>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          <div className="px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">Notifications</h2>
          </div>

          <div className="flex flex-col gap-1 px-5 py-4">
            <label htmlFor="notifyPhone" className="text-xs font-medium text-zinc-500">
              SMS alert number
            </label>
            <input
              id="notifyPhone"
              name="notifyPhone"
              type="tel"
              defaultValue={settings?.notifyPhone ?? ''}
              placeholder="+447700900123"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
            <p className="text-xs text-zinc-400">Where to send the SMS when a lead comes in.</p>
          </div>

          <div className="flex flex-col gap-1 px-5 py-4">
            <label htmlFor="notifyEmail" className="text-xs font-medium text-zinc-500">
              Email alert address
            </label>
            <input
              id="notifyEmail"
              name="notifyEmail"
              type="email"
              defaultValue={settings?.notifyEmail ?? ''}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
            <p className="text-xs text-zinc-400">Where to send the email when a lead comes in.</p>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  )
}
