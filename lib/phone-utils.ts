// Converts UK phone numbers spoken/typed in any format to E.164
export function normaliseUKPhone(raw: string): string {
  // Strip all spaces, dashes, brackets
  const digits = raw.replace(/[\s\-().]/g, '')

  if (digits.startsWith('+44')) return digits          // already E.164
  if (digits.startsWith('0044')) return '+44' + digits.slice(4)
  if (digits.startsWith('0')) return '+44' + digits.slice(1)

  return raw // return as-is if unrecognised
}

export function generateSimulatedNumber(): string {
  const suffix = String(Math.floor(Math.random() * 900) + 100)
  return `+44207946${suffix}`
}

export function formatPhoneNumber(raw: string): string {
  if (raw.startsWith('+44207946')) {
    const last = raw.slice(9)
    return `+44 20 7946 ${last}`
  }
  if (raw.startsWith('+1')) {
    const digits = raw.slice(2)
    return `+1 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  return raw
}
