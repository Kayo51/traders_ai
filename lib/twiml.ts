const VOICE = 'Polly.Amy-Neural'
const LANGUAGE = 'en-GB'

function xml(content: string): Response {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response>${content}</Response>`,
    { headers: { 'Content-Type': 'text/xml' } }
  )
}

function say(text: string): string {
  return `<Say voice="${VOICE}" language="${LANGUAGE}">${escapeXml(text)}</Say>`
}

export function gatherResponse(text: string, actionUrl: string): Response {
  return xml(`
    ${say(text)}
    <Gather input="speech" action="${actionUrl}" speechTimeout="auto" timeout="8" language="${LANGUAGE}">
    </Gather>
    ${say("Sorry, I didn't catch that. Please try calling back.")}
    <Hangup/>
  `)
}

export function hangupResponse(text: string): Response {
  return xml(`${say(text)}<Hangup/>`)
}

export function errorResponse(): Response {
  return xml(`${say("Sorry, something went wrong on our end. Please try calling back shortly.")}<Hangup/>`)
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
