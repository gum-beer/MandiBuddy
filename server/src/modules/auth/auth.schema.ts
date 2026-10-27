import { z } from 'zod'

export const signInSchema = z.strictObject({
  username: z.string({ error: 'Enter your username' }).trim().min(1, 'Enter your username'),
  // Not trimmed: spaces are part of a password.
  password: z.string({ error: 'Enter your password' }).min(1, 'Enter your password'),
})

export type SignInInput = z.infer<typeof signInSchema>
