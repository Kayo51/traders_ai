import { config } from 'dotenv'

config({ path: '.env.local' })

async function main() {
  const { default: db } = await import('../lib/db')

  const businessId = process.env.DEV_BUSINESS_ID
  if (!businessId) throw new Error('DEV_BUSINESS_ID not set')

  await db.businessSettings.update({
    where: { businessId },
    data: {
      notifyPhone: '+447943724868',
      notifyEmail: 'kobbyokyere132@yahoo.com',
    },
  })

  console.log('✓ notifyPhone and notifyEmail saved')
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
