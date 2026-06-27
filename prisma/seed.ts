import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  const business = await db.business.upsert({
    where: { slug: 'dev-plumbing' },
    update: {},
    create: {
      name: 'Dev Plumbing Co',
      slug: 'dev-plumbing',
      ownerEmail: 'dev@tradeflow.ai',
      ownerPhone: '07700900000',
    },
  })

  await db.businessSettings.upsert({
    where: { businessId: business.id },
    update: {},
    create: { businessId: business.id },
  })

  console.log(business.id)
}

main().catch(console.error).finally(() => db.$disconnect())
