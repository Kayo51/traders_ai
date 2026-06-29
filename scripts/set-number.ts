import { config } from 'dotenv'

config({ path: '.env.local' })

async function main() {
  const { default: db } = await import('../lib/db')

  const businessId = process.env.DEV_BUSINESS_ID
  if (!businessId) throw new Error('DEV_BUSINESS_ID not set')

  await db.business.update({
    where: { id: businessId },
    data: {
      twilioPhoneNumber: '+19206884140',
      twilioNumberSid: 'purchased-via-console',
    },
  })

  console.log('✓ Phone number +19206884140 saved to database for business', businessId)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
