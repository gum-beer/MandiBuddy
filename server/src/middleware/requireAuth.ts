import type { RequestHandler } from 'express'
import { AppError } from '../lib/AppError.ts'

// Mock auth (CLAUDE.md §3): the token is `mock-<userId>`, sent as `Authorization: Bearer <token>`.
// Replaced in the auth phase.
const MOCK_TOKEN = /^Bearer mock-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const userId = MOCK_TOKEN.exec(req.get('authorization') ?? '')?.[1]
  const user = userId ? await req.db.user.findUnique({ where: { id: userId } }) : null
  if (!user) throw new AppError(401, 'UNAUTHENTICATED', 'Please sign in')

  req.ctx = { db: req.db, tenantId: user.tenantId, userId: user.id }
  next()
}
