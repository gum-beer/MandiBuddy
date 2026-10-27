import { fileURLToPath } from 'node:url'
import { defineConfig, env } from 'prisma/config'

// Load server/.env; variables already set in the environment win (tests rely on this).
try {
  process.loadEnvFile(fileURLToPath(new URL('./.env', import.meta.url)))
} catch {
  // No .env file: use the real environment.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
