import { getCurrentBusiness } from '@/lib/onboarding'
import { saveSettings } from './actions'
import { getDelays } from '@/lib/follow-up-scheduler'
import type { BusinessSettings } from '@prisma/client'

export default async function SettingsPage() {
  const business = await getCurrentBusiness()
  const settings = business?.settings ?? null

  const delays = settings ? getDelays(settings as unknown as BusinessSettings) : [5, 24, 36, 48]

  return (
    <div className="flex flex-col gap-8 p-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Configure how your AI receptionist behaves.</p>
      </div>

      <form action={saveSettings} className="flex flex-col gap-6">
        {/* === Business === */}
        <section className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          <div className="px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">Business</h2>
          </div>
          <div className="flex flex-col gap-1 px-5 py-4">
            <label className="text-xs font-medium text-zinc-500">Business name</label>
            <p className="text-sm text-zinc-900">{business?.name ?? '—'}</p>
          </div>
          <div className="flex flex-col gap-1 px-5 py-4">
            <label htmlFor="greetingMessage" className="text-xs font-medium text-zinc-500">AI greeting message</label>
            <textarea
              id="greetingMessage" name="greetingMessage" rows={3}
              defaultValue={settings?.greetingMessage ?? ''}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none"
            />
            <p className="text-xs text-zinc-400">This is the first thing callers hear.</p>
          </div>
        </section>

        {/* === Notifications === */}
        <section className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          <div className="px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">Notifications</h2>
          </div>
          <div className="flex flex-col gap-1 px-5 py-4">
            <label htmlFor="notifyPhone" className="text-xs font-medium text-zinc-500">SMS alert number</label>
            <input id="notifyPhone" name="notifyPhone" type="tel"
              defaultValue={settings?.notifyPhone ?? ''} placeholder="+447700900123"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
            <p className="text-xs text-zinc-400">Where to send the SMS when a lead comes in.</p>
          </div>
          <div className="flex flex-col gap-1 px-5 py-4">
            <label htmlFor="notifyEmail" className="text-xs font-medium text-zinc-500">Email alert address</label>
            <input id="notifyEmail" name="notifyEmail" type="email"
              defaultValue={settings?.notifyEmail ?? ''} placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
            <p className="text-xs text-zinc-400">Where to send the email when a lead comes in.</p>
          </div>
        </section>

        {/* === Customer Follow-ups === */}
        <section className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Customer Follow-ups</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Automatically reassure customers while they wait for a callback.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="customerFollowUpEnabled" className="sr-only peer"
                defaultChecked={settings?.customerFollowUpEnabled ?? true}
              />
              <div className="w-10 h-5 bg-zinc-200 peer-focus:ring-2 peer-focus:ring-zinc-400 rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-zinc-900 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
            </label>
          </div>

          <div className="px-5 py-4">
            <p className="mb-3 text-xs font-medium text-zinc-500">Communication method</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                <input type="checkbox" name="followUpSmsEnabled" defaultChecked={settings?.followUpSmsEnabled ?? true}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                />
                SMS
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                <input type="checkbox" name="followUpEmailEnabled" defaultChecked={settings?.followUpEmailEnabled ?? true}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                />
                Email
              </label>
            </div>
          </div>

          <div className="px-5 py-4">
            <p className="mb-3 text-xs font-medium text-zinc-500">Reminder schedule (hours after enquiry received)</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(['1st', '2nd', '3rd', '4th'] as const).map((label, i) => (
                <div key={label} className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-400">{label} reminder</label>
                  <div className="flex items-center gap-1">
                    <input type="number" name={`followUpDelay${i}`} min={1} max={168}
                      defaultValue={delays[i] ?? [5, 24, 36, 48][i]}
                      className="w-16 rounded-lg border border-zinc-200 px-2 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                    <span className="text-xs text-zinc-400">h</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-zinc-400">After the 4th reminder, messages are sent every 24 hours.</p>
          </div>

          <div className="flex flex-col gap-1 px-5 py-4">
            <label htmlFor="followUpMaxDays" className="text-xs font-medium text-zinc-500">Stop after (days)</label>
            <div className="flex items-center gap-2">
              <input id="followUpMaxDays" name="followUpMaxDays" type="number" min={1} max={30}
                defaultValue={settings?.followUpMaxDays ?? 7}
                className="w-20 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
              <span className="text-xs text-zinc-400">days after the enquiry</span>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit"
            className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  )
}
