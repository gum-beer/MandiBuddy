import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.ts'
import { validate } from '../../middleware/validate.ts'
import * as authController from './auth.controller.ts'
import { signInSchema } from './auth.schema.ts'

export const authRoutes = Router()

authRoutes.post('/sign-in', validate(signInSchema), authController.signIn)
authRoutes.get('/me', requireAuth, authController.me)
