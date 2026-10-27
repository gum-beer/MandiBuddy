import { requireEnv } from '../src/env.ts'

// Tests wipe this database, so refuse anything that is not clearly a test database.
export function testDbUrl(): string {
  const url = requireEnv('TEST_DATABASE_URL')
  if (!new URL(url).pathname.endsWith('_test')) {
    throw new Error(`TEST_DATABASE_URL must point at a *_test database, got ${url}`)
  }
  return url
}
