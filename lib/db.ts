import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'

const createClient = () => {
  const sql = neon(process.env.DATABASE_URL!)
  const adapter = new PrismaNeon(sql)
  return new PrismaClient({ adapter })
}

declare global {
  var prisma: ReturnType<typeof createClient> | undefined
}

const db = globalThis.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}

export default db
