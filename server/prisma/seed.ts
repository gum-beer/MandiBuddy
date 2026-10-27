// `npm run db:seed` — WIPES dev data, then creates the mock sign-in user abc / abc (CLAUDE.md §3).
import { createPrisma } from '../src/db/prisma.ts'
import { requireEnv } from '../src/env.ts'

const db = createPrisma(requireEnv('DATABASE_URL'))

try {
  await db.$transaction([db.user.deleteMany(), db.tenant.deleteMany()])
  const tenant = await db.tenant.create({
    data: { name: 'Demo Trader', users: { create: { username: 'abc', password: 'abc' } } },
  })
  console.log(`Seeded tenant "${tenant.name}" with user abc / abc`)
} finally {
  await db.$disconnect()
}
