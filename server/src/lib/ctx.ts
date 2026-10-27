import type { Prisma, PrismaClient } from '../generated/prisma/client.ts'

/** The app's client, or the `tx` inside `$transaction(async (tx) => …)`. */
export type Db = PrismaClient | Prisma.TransactionClient

/** What every service receives as its first argument (CLAUDE.md §5.1). */
export interface Ctx {
  db: Db
  tenantId: string
  userId: string
}

/** For the few services that run before sign-in (only auth for now). */
export type DbCtx = Pick<Ctx, 'db'>
