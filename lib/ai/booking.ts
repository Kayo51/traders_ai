import Anthropic from '@anthropic-ai/sdk'
import type { CalendarSlot } from '@/lib/calendar'

const client = new Anthropic()

export async function pickSlot(speech: string, slots: CalendarSlot[]): Promise<number | null> {
  if (slots.length === 0) return null

  const slotList = slots.map((s, i) => `${i + 1}. ${s.label}`).join('\n')

  const res = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 10,
    system: `You identify which appointment slot a caller wants from a list.
The caller may pick by number ("the first one"), by day ("Thursday"), by time ("2pm"),
by description ("Thursday afternoon", "Friday morning"), or by expressing a preference.
Match to the closest available slot.
Reply with just the slot number (1, 2, 3...) or "none" if they are declining, want the plumber to call them, or their preference doesn't match any slot.`,
    messages: [{
      role: 'user',
      content: `Available slots:\n${slotList}\n\nCaller said: "${speech}"\n\nSlot number or "none":`,
    }],
  })

  const text = res.content[0].type === 'text' ? res.content[0].text.trim() : ''
  const num = parseInt(text, 10)
  if (isNaN(num) || num < 1 || num > slots.length) return null
  return num - 1
}
