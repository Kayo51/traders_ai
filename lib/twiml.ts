const LANGUAGE = 'en-GB'

function xml(content: string): Response {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response>${content}</Response>`,
    { headers: { 'Content-Type': 'text/xml' } }
  )
}

function playById(id: string): string {
  return `<Play>${process.env.NEXT_PUBLIC_APP_URL}/api/tts?id=${id}</Play>`
}

function safeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function gatherResponse(audioId: string, actionUrl: string): Response {
  return xml(`
    <Gather input="speech" action="${actionUrl}" speechTimeout="auto" timeout="10" language="${LANGUAGE}">
      ${playById(audioId)}
    </Gather>
    <Redirect method="POST">${actionUrl}</Redirect>
  `)
}

export function gatherResponseWithPlay(playUrl: string, actionUrl: string): Response {
  return xml(`
    <Gather input="speech" action="${actionUrl}" speechTimeout="auto" timeout="10" language="${LANGUAGE}">
      <Play>${playUrl}</Play>
    </Gather>
    <Redirect method="POST">${actionUrl}</Redirect>
  `)
}

export function gatherResponseWithSay(text: string, actionUrl: string): Response {
  return xml(`
    <Gather input="speech" action="${actionUrl}" speechTimeout="auto" timeout="10" language="${LANGUAGE}">
      <Say voice="alice" language="${LANGUAGE}">${safeText(text)}</Say>
    </Gather>
    <Redirect method="POST">${actionUrl}</Redirect>
  `)
}

export function hangupResponse(audioId: string): Response {
  return xml(`${playById(audioId)}<Hangup/>`)
}

export function hangupResponseWithSay(text: string): Response {
  return xml(`<Say voice="alice" language="${LANGUAGE}">${safeText(text)}</Say><Hangup/>`)
}

export function errorResponse(): Response {
  return xml(`
    <Say language="${LANGUAGE}">Sorry, something went wrong. Please try calling back shortly.</Say>
    <Hangup/>
  `)
}
