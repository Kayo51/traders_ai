import { config } from 'dotenv'

config({ path: '.env.local' })

async function main() {
  const { default: twilio } = await import('twilio')

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

  const call = await client.calls.create({
    to: '+447943724868',
    from: process.env.TWILIO_FROM_NUMBER!,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice`,
    method: 'POST',
  })

  console.log(`✓ Calling +447943724868 now... (SID: ${call.sid})`)
  console.log('  Pick up your phone — the AI receptionist will greet you.')
  process.exit(0)
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
