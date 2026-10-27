import type { Ctx, Db } from '../lib/ctx.ts'

declare module 'express-serve-static-core' {
  interface Request {
    /** Set by createApp for every request. */
    db: Db
    /** Set by requireAuth; only present on authenticated routes. */
    ctx: Ctx
  }
}
