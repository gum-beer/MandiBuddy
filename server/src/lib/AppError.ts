// Throw this from services and middleware; errorHandler turns it into
// `{ error: { code, message, field } }`. Business-rule violations are 422 with a `field` (CLAUDE.md §5.6).
export class AppError extends Error {
  readonly status: number
  readonly code: string
  readonly field?: string

  constructor(status: number, code: string, message: string, opts: { field?: string } = {}) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.field = opts.field
  }
}
