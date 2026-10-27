import { defineConfig } from 'vitest/config'
import './src/env.ts'

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: ['./test/globalSetup.ts'],
    // All API tests share one test database, so run files one at a time.
    fileParallelism: false,
  },
})
