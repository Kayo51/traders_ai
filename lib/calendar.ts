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
    scope: 'https://www.googleapis.com/auth/calendar.events',
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
  // Get the UK hour at noon UTC on this date to determine offset
  const noonRef = new Date(Date.UTC(dateUTC.getUTCFullYear(), dateUTC.getUTCMonth(), dateUTC.getUTCDate(), 12, 0, 0))
  const ukHourAtNoon = parseInt(
    new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hour12: false }).format(noonRef),
    10
  )
  return ukHourAtNoon - 12 // 0 for GMT, 1 for BST
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

      // Skip slots less than 1 hour away
      if (startUTC.getTime() < now.getTime() + 3_600_000) continue

      candidates.push({
        start: startUTC.toISOString(),
        end:   endUTC.toISOString(),
        label: labelFmt.format(startUTC),
      })
    }
  }

  if (candidates.length === 0) return []

  const freeBusy = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeMin: candidates[0].start,
      timeMax: candidates[candidates.length - 1].end,
      items: [{ id: calendarId }],
    }),
  }).then(r => r.json())

  const busy: { start: string; end: string }[] = freeBusy.calendars?.[calendarId]?.busy ?? []

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
    .slice(0, 3)
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

  return event.id as string
}

export function buildSlotOffer(slots: CalendarSlot[]): string {
  if (slots.length === 0) return ''
  if (slots.length === 1) return `I can also book you straight in. We have ${slots[0].label} available — would that work for you?`
  if (slots.length === 2) return `I can also book you straight in. I have ${slots[0].label} or ${slots[1].label} — which works best?`
  return `I can also book you straight in. I have ${slots[0].label}, ${slots[1].label}, or ${slots[2].label}. Which works best for you?`
}

export function buildSlotReprompt(slots: CalendarSlot[]): string {
  if (slots.length === 1) return `Just to confirm — is ${slots[0].label} okay for you?`
  if (slots.length === 2) return `Sorry, I didn't quite catch that. Is it ${slots[0].label} or ${slots[1].label}?`
  return `Sorry about that — I have ${slots[0].label}, ${slots[1].label}, or ${slots[2].label}. Which would you like?`
}
