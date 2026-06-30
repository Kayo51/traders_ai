import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { exchangeCode } from '@/lib/calendar'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code       = searchParams.get('code')
  const businessId = searchParams.get('state')
  const error      = searchParams.get('error')

  const base = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
  const settingsUrl = new URL('/dashboard/settings', base)

  if (error || !code || !businessId) {
    settingsUrl.searchParams.set('calendarError', error ?? 'cancelled')
    return NextResponse.redirect(settingsUrl)
  }

  try {
    const { accessToken, refreshToken, expiry } = await exchangeCode(code)
    await db.businessSettings.update({
      where: { businessId },
      data: {
        googleAccessToken:  accessToken,
        googleRefreshToken: refreshToken,
        googleTokenExpiry:  expiry,
        bookingEnabled:     true,
      },
    })
    settingsUrl.searchParams.set('calendarConnected', '1')
  } catch (err) {
    console.error('[google/callback]', err)
    settingsUrl.searchParams.set('calendarError', 'exchange_failed')
  }

  return NextResponse.redirect(settingsUrl)
}
