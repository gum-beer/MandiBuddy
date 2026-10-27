// Mock sign-in (CLAUDE.md §3): plain-text password check, token = `mock-<userId>`.
// No JWT/sessions until the auth phase.
import { AppError } from '../../lib/AppError.ts'
import type { Ctx, DbCtx } from '../../lib/ctx.ts'
import type { SignInInput } from './auth.schema.ts'

export async function signIn(ctx: DbCtx, input: SignInInput) {
  const user = await ctx.db.user.findUnique({
    where: { username: input.username },
    include: { tenant: true },
  })
  if (!user || user.password !== input.password) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Wrong username or password')
  }
  return {
    token: `mock-${user.id}`,
    user: { id: user.id, username: user.username },
    tenant: { id: user.tenant.id, name: user.tenant.name },
  }
}

export async function getMe(ctx: Ctx) {
  const user = await ctx.db.user.findFirst({
    where: { id: ctx.userId, tenantId: ctx.tenantId },
    include: { tenant: true },
  })
  if (!user) throw new AppError(401, 'UNAUTHENTICATED', 'Please sign in')
  return {
    user: { id: user.id, username: user.username },
    tenant: { id: user.tenant.id, name: user.tenant.name },
  }
}
