import { createPrisma } from '../src/db/prisma.ts'
import { testDbUrl } from './testDbUrl.ts'

export const testDb = createPrisma(testDbUrl())

export async function resetDb() {
  await testDb.$executeRawUnsafe('TRUNCATE TABLE users, tenants CASCADE')
}

/** Tenant A has the mock user abc / abc; tenant B exists to prove isolation. */
export async function seedTwoTenants() {
  const tenantA = await testDb.tenant.create({
    data: { name: 'Tenant A', users: { create: { username: 'abc', password: 'abc' } } },
    include: { users: true },
  })
  const tenantB = await testDb.tenant.create({
    data: { name: 'Tenant B', users: { create: { username: 'xyz', password: 'xyz' } } },
    include: { users: true },
  })
  return { tenantA, userA: tenantA.users[0], tenantB, userB: tenantB.users[0] }
}
