import { fileURLToPath } from 'node:url'

// Load server/.env; variables already set in the environment win.
try {
  process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)))
} catch {
  // No .env file: use the real environment.
}

export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set. Copy server/.env.example to server/.env.`)
  return value
}
