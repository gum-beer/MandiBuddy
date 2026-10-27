import type { Request, Response } from 'express'
import * as authService from './auth.service.ts'

export async function signIn(req: Request, res: Response) {
  res.json(await authService.signIn({ db: req.db }, req.body))
}

export async function me(req: Request, res: Response) {
  res.json(await authService.getMe(req.ctx))
}
