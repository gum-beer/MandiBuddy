import type { ErrorRequestHandler, RequestHandler } from 'express'
import { AppError } from '../lib/AppError.ts'

export const notFound: RequestHandler = (req) => {
  throw new AppError(404, 'NOT_FOUND', `No route for ${req.method} ${req.path}`)
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, field: err.field } })
    return
  }
  // Malformed JSON body, raised by express.json().
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON' } })
    return
  }
  console.error(err)
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong' } })
}
