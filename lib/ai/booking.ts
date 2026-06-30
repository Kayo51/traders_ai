import Anthropic from '@anthropic-ai/sdk'
import type { CalendarSlot } from '@/lib/calendar'

const client = new Anthropic()

export async function pickSlot(speech: string, slots: CalendarSlot[]): Promise<number | 'unavailable' | null> {
  if (slots.length === 0) return null

  const now = new Date()
  const tz = 'Europe/London'
  const today = new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'long' }).format(now)
  const tomorrowDate = new Date(now)
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'long' }).format(tomorrowDate)

  const slotList = slots.map((s, i) => `${i + 1}. ${s.label}`).join('\n')

  const res = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 15,
    system: `You identify which appointment slot a caller wants from a list.
Today is ${today}. Tomorrow is ${tomorrow}.
The caller may pick by number, by day ("Thursday"), by time ("2pm"), or describe a preference ("tomorrow at 1pm", "Thursday afternoon").
Reply with:
- Just the slot number (1, 2, 3...) if their preference matches an available slot
- "unavailable" if they specified a time that is NOT in the list (so we can suggest alternatives)
- "none" if they are declining or want the plumber to call them instead`,
    messages: [{
      role: 'user',
      content: `Available slots:\n${slotList}\n\nCaller said: "${speech}"\n\nReply:`,
    }],
  })

  const text = (res.content[0].type === 'text' ? res.content[0].text.trim() : '').toLowerCase()
  if (text === 'unavailable') return 'unavailable'
  if (text === 'none') return null
  const num = parseInt(text, 10)
  if (isNaN(num) || num < 1 || num > slots.length) return null
  return num - 1
}
