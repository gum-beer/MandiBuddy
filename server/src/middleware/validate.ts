import type { RequestHandler } from 'express'
import type { ZodType } from 'zod'
import { AppError } from '../lib/AppError.ts'

// Parses req.body with the endpoint's Zod schema and replaces it with the parsed value (CLAUDE.md §5.3).
// Schemas use z.strictObject (unknown keys rejected), .trim() on text and z.coerce for numbers.
export function validate(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const issue = result.error.issues[0]
      const field = issue.code === 'unrecognized_keys' ? issue.keys[0] : issue.path.join('.')
      throw new AppError(400, 'VALIDATION_ERROR', issue.message, { field: field || undefined })
    }
    req.body = result.data
    next()
  }
}
