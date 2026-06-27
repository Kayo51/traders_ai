import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const createClient = () => {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
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
