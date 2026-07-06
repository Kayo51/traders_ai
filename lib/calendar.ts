import db from '@/lib/db'

export type CalendarSlot = {
  start: string  // ISO UTC
  end: string    // ISO UTC
  label: string  // "Thursday at 2:00 pm"
}


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
  const weekdayFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'long' })

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
        // "Thursday at 2 PM" — space-separated AM/PM avoids TTS slurring
        label: `${weekdayFmt.format(startUTC)} at ${formatHour(startUTC)}`,
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
    .slice(0, 20)  // keep up to 20 so AI can match any caller-suggested time
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

export type DayWindow = {
  dayLabel: string   // "tomorrow", "Tuesday"
  ranges: string[]   // ["9am to 5pm", "7pm to 9pm"]
}

function formatHour(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true,
  }).formatToParts(date)
  const hour   = parts.find(p => p.type === 'hour')?.value ?? ''
  const min    = parts.find(p => p.type === 'minute')?.value ?? '00'
  const period = (parts.find(p => p.type === 'dayPeriod')?.value ?? '').toUpperCase().replace(/\s+/g, '')
  // Space between number and AM/PM so TTS reads them as separate tokens, avoiding slurring
  return min === '00' ? `${hour} ${period}` : `${hour}:${min} ${period}`
}

export function computeDayWindows(slots: CalendarSlot[]): DayWindow[] {
  if (slots.length === 0) return []

  const now = new Date()
  const dateFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })

  const tomorrowRef = new Date(now)
  tomorrowRef.setDate(tomorrowRef.getDate() + 1)
  const tomorrowKey = dateFmt.format(tomorrowRef)

  const byDay = new Map<string, CalendarSlot[]>()
  for (const slot of slots) {
    const key = dateFmt.format(new Date(slot.start))
    if (!byDay.has(key)) byDay.set(key, [])
    byDay.get(key)!.push(slot)
  }

  const result: DayWindow[] = []
  for (const [dateKey, daySlots] of byDay) {
    daySlots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

    const slotDate = new Date(daySlots[0].start)
    const weekday  = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'long' }).format(slotDate)
    const dayLabel = dateKey === tomorrowKey ? 'tomorrow' : weekday

    const ranges: string[] = []
    let rangeStart = daySlots[0]
    let prev = daySlots[0]

    for (let i = 1; i < daySlots.length; i++) {
      const curr = daySlots[i]
      if (new Date(curr.start).getTime() === new Date(prev.end).getTime()) {
        prev = curr
      } else {
        ranges.push(`${formatHour(new Date(rangeStart.start))} to ${formatHour(new Date(prev.end))}`)
        rangeStart = curr
        prev = curr
      }
    }
    ranges.push(`${formatHour(new Date(rangeStart.start))} to ${formatHour(new Date(prev.end))}`)

    result.push({ dayLabel, ranges })
  }
  return result
}

function describeWindows(windows: DayWindow[]): string {
  const parts = windows.map(w => `${w.dayLabel} from ${w.ranges.join(' and ')}`)
  if (parts.length === 1) return parts[0]
  return parts.slice(0, -1).join(', ') + ', and ' + parts[parts.length - 1]
}

export function buildWindowOffer(windows: DayWindow[]): string {
  if (windows.length === 0) {
    return "I'm afraid we don't have any availability just now, but the plumber will give you a call to arrange a time."
  }
  return `I can book you straight in — we have availability ${describeWindows(windows)}. What time works best for you, or would you prefer the plumber to call you to arrange?`
}

export function buildWindowReprompt(windows: DayWindow[]): string {
  if (windows.length === 0) {
    return "Sorry about that. The plumber will give you a call to arrange a time — is there anything else I can help with?"
  }
  return `Sorry about that — we have availability ${describeWindows(windows)}. What time would suit you best, or shall the plumber call you to arrange?`
}

export function buildWindowUnavailable(windows: DayWindow[]): string {
  if (windows.length === 0) {
    return "I'm afraid that time isn't available and we're fully booked at the moment. The plumber will call you to arrange a time."
  }
  return `I'm afraid that time isn't available, but we do have ${describeWindows(windows)}. What time would suit you best?`
}
