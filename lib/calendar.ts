import db from '@/lib/db'

export type CalendarSlot = {
  start: string  // ISO UTC
  end: string    // ISO UTC
  label: string  // "Thursday at 2:00 pm"
}

export const OPEN_MODE_THRESHOLD = 5  // if 5+ slots free, ask open-ended rather than listing

const TZ = 'Europe/London'

export function getAuthUrl(businessId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar',  // full access — required for freeBusy API
    access_type: 'offline',
    prompt: 'consent',
    state: businessId,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeCode(code: string): Promise<{ accessToken: string; refreshToken: string; expiry: Date }> {
  const data = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  }).then(r => r.json())
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiry: new Date(Date.now() + data.expires_in * 1000),
  }
}

type TokenSettings = {
  googleAccessToken: string | null
  googleRefreshToken: string | null
  googleTokenExpiry: Date | null
}

export async function getValidToken(settings: TokenSettings, businessId: string): Promise<string> {
  if (settings.googleTokenExpiry && settings.googleTokenExpiry.getTime() > Date.now() + 60_000) {
    return settings.googleAccessToken!
  }
  const data = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: settings.googleRefreshToken!,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  }).then(r => r.json())

  if (!data.access_token) {
    console.error('[calendar] token refresh failed:', data)
    throw new Error('Failed to refresh Google access token')
  }

  const expiry = new Date(Date.now() + data.expires_in * 1000)
  await db.businessSettings.update({
    where: { businessId },
    data: { googleAccessToken: data.access_token, googleTokenExpiry: expiry },
  })
  return data.access_token
}

type SlotSettings = TokenSettings & {
  googleCalendarId: string | null
  bookingWindowDays: number
  bookingSlotDuration: number
  bookingHoursStart: number
  bookingHoursEnd: number
}

function getUKOffsetHours(dateUTC: Date): number {
  const noonRef = new Date(Date.UTC(dateUTC.getUTCFullYear(), dateUTC.getUTCMonth(), dateUTC.getUTCDate(), 12, 0, 0))
  const ukHourAtNoon = parseInt(
    new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hour12: false }).format(noonRef),
    10
  )
  return ukHourAtNoon - 12
}

export async function getAvailableSlots(settings: SlotSettings, businessId: string): Promise<CalendarSlot[]> {
  const token = await getValidToken(settings, businessId)
  const calendarId = settings.googleCalendarId || 'primary'
  const now = new Date()
  const candidates: CalendarSlot[] = []
  const dateFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
  const labelFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true })

  for (let dayOffset = 0; dayOffset < settings.bookingWindowDays; dayOffset++) {
    const ref = new Date(now)
    ref.setDate(ref.getDate() + dayOffset)

    const parts = dateFmt.formatToParts(ref)
    const y  = parseInt(parts.find(p => p.type === 'year')!.value)
    const mo = parseInt(parts.find(p => p.type === 'month')!.value)
    const d  = parseInt(parts.find(p => p.type === 'day')!.value)
    const ukOffset = getUKOffsetHours(new Date(Date.UTC(y, mo - 1, d, 12, 0, 0)))

    const slotMins = settings.bookingSlotDuration
    for (let startMin = settings.bookingHoursStart * 60; startMin + slotMins <= settings.bookingHoursEnd * 60; startMin += slotMins) {
      const h = Math.floor(startMin / 60)
      const m = startMin % 60
      const startUTC = new Date(Date.UTC(y, mo - 1, d, h - ukOffset, m, 0))
      const endUTC   = new Date(startUTC.getTime() + slotMins * 60_000)

      if (startUTC.getTime() < now.getTime() + 3_600_000) continue

      candidates.push({
        start: startUTC.toISOString(),
        end:   endUTC.toISOString(),
        label: labelFmt.format(startUTC),
      })
    }
  }

  if (candidates.length === 0) return []

  // Check free/busy — requires https://www.googleapis.com/auth/calendar scope
  const freeBusyRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeMin: candidates[0].start,
      timeMax: candidates[candidates.length - 1].end,
      items: [{ id: calendarId }],
    }),
  }).then(r => r.json())

  if (freeBusyRes.error) {
    console.error('[calendar] freeBusy API error:', freeBusyRes.error)
    throw new Error(`FreeBusy API error: ${freeBusyRes.error.message}`)
  }

  const busy: { start: string; end: string }[] = freeBusyRes.calendars?.[calendarId]?.busy ?? []

  return candidates
    .filter(slot => {
      const sS = new Date(slot.start).getTime()
      const sE = new Date(slot.end).getTime()
      return !busy.some(b => {
        const bS = new Date(b.start).getTime()
        const bE = new Date(b.end).getTime()
        return sS < bE && sE > bS
      })
    })
    .slice(0, 6)  // keep up to 6 so AI has more to match against
}

export async function createBooking(
  settings: SlotSettings,
  businessId: string,
  slot: CalendarSlot,
  callerName: string | null,
  description: string | null,
): Promise<string> {
  const token = await getValidToken(settings, businessId)
  const calendarId = settings.googleCalendarId || 'primary'

  const event = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: `${callerName ?? 'Customer'} — ${description ?? 'Plumbing job'}`,
        description: description ?? '',
        start: { dateTime: slot.start, timeZone: 'UTC' },
        end:   { dateTime: slot.end,   timeZone: 'UTC' },
      }),
    }
  ).then(r => r.json())

  if (!event.id) {
    console.error('[calendar] createBooking error:', event)
    throw new Error('Failed to create calendar event')
  }

  return event.id as string
}

export function buildSlotOffer(slots: CalendarSlot[], openMode: boolean): string {
  if (openMode) {
    return `I can also book you straight in — we have good availability over the next few days. What day and time would suit you best? Or if you'd prefer, the plumber can just call you to arrange.`
  }
  if (slots.length === 1) {
    return `I can also book you straight in. The only slot I have available is ${slots[0].label}. Does that work for you, or would you prefer the plumber to call you to arrange a time?`
  }
  if (slots.length === 2) {
    return `I can also book you straight in. I have ${slots[0].label} or ${slots[1].label} available. Which works best, or would you prefer the plumber to call you?`
  }
  return `I can also book you straight in. I have ${slots[0].label}, ${slots[1].label}, or ${slots[2].label} available. Which works best for you, or would you prefer the plumber to call you to arrange?`
}

export function buildSlotReprompt(slots: CalendarSlot[], retries: number): string {
  if (retries <= 1) {
    return `Sorry, I didn't quite catch that. What day and time would suit you best? Or just say the word and the plumber will call you directly to arrange.`
  }
  if (slots.length === 1) return `Is ${slots[0].label} okay, or shall I have the plumber call you?`
  return `Sorry about that — shall I book you in for one of those times, or would you prefer the plumber to give you a call?`
}
