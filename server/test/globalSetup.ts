// Runs once before all server tests: applies migrations to the Docker test database (Q4).
import { execSync } from 'node:child_process'
import { testDbUrl } from './testDbUrl.ts'

export default function setup() {
  const url = testDbUrl()
  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL: url },
    })
  } catch (err) {
    const output = (err as { stderr?: Buffer }).stderr?.toString() ?? String(err)
    throw new Error(
      `Could not migrate the test database. Is Postgres running? Try \`npm run db:up\`.\n${output}`,
    )
  }
}
