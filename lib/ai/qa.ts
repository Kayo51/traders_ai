import Anthropic from '@anthropic-ai/sdk'
import type { Message } from './receptionist'

export type QAResult =
  | { done: false; reply: string }
  | { done: true; reply: string }

const client = new Anthropic()

export function buildQASystem(businessName: string, callerName: string | null, issue: string | null): string {
  return `You are the AI receptionist for ${businessName}, a UK plumbing business. You have already taken the caller's details and the plumber will call them back shortly.

The caller's name is ${callerName ?? 'the caller'}.
${issue ? `Their issue: ${issue}` : ''}

You are now in a Q&A phase where you answer any remaining questions they have before the call ends.

Answer questions warmly and helpfully, like a knowledgeable receptionist. Keep answers to 2–3 sentences. After each answer, ask "Is there anything else I can help you with?" — unless they are clearly wrapping up.

Common questions and how to handle them:
- Callback timing → "The plumber aims to call back within the hour. For emergencies they'll prioritise you."
- Cost/pricing → "Pricing depends on the job — the plumber will give you a full quote when they call."
- Coverage area → "As long as your postcode is logged, the plumber will confirm coverage when they call."
- Weekend/out-of-hours → "We do have availability outside normal hours — the plumber will discuss timing with you."
- Emergency escalation → "If it becomes urgent, please call back and mention it's an emergency — we'll prioritise it."
- General reassurance → Be warm, confident, and brief.

RULES:
- Never use emojis, asterisks, bullet points, or any special characters — your reply is read aloud
- Use natural spoken English with contractions
- Keep replies to 2–3 sentences maximum
- Be empathetic if the caller is stressed or worried
- NEVER make up specific prices, names, or guarantees you can't stand behind

WHEN THE CALLER IS DONE (says things like "no", "that's all", "thank you", "okay bye", "nothing else", "I'm good"):
Output ONLY this JSON with no other text:
{"done":true,"reply":"FAREWELL_MESSAGE"}

The farewell should be warm and brief — e.g. "You're welcome. The plumber will be with you very soon. Take care, goodbye!"`
}

export async function answerQuestion(
  messages: Message[],
  systemPrompt: string
): Promise<QAResult> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 180,
    system: systemPrompt,
    messages,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

  // Detect done signal
  const jsonMatch = text.match(/\{\s*"done"\s*:\s*true[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.done === true) {
        return { done: true, reply: parsed.reply ?? "Take care, goodbye!" }
      }
    } catch {
      // fall through
    }
  }

  return { done: false, reply: text }
}
