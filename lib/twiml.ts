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

export function gatherResponse(audioId: string, actionUrl: string): Response {
  return xml(`
    <Gather input="speech" action="${actionUrl}" speechTimeout="auto" timeout="10" language="${LANGUAGE}">
      ${playById(audioId)}
    </Gather>
    <Redirect method="POST">${actionUrl}</Redirect>
  `)
}

export function hangupResponse(audioId: string): Response {
  return xml(`${playById(audioId)}<Hangup/>`)
}

export function errorResponse(): Response {
  return xml(`
    <Say language="${LANGUAGE}">Sorry, something went wrong. Please try calling back shortly.</Say>
    <Hangup/>
  `)
}
