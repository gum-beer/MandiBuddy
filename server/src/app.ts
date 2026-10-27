import express from 'express'
import type { PrismaClient } from './generated/prisma/client.ts'
import { errorHandler, notFound } from './middleware/errorHandler.ts'
import { authRoutes } from './modules/auth/auth.routes.ts'

// Builds the app around a db client, so tests can pass in a client for the test database.
export function createApp(db: PrismaClient) {
  const app = express()
  app.use(express.json())
  app.use((req, _res, next) => {
    req.db = db
    next()
  })

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })
  app.use('/api/auth', authRoutes)

  app.use(notFound)
  app.use(errorHandler)
  return app
}
