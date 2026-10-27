import { requireEnv } from './env.ts'
import { createApp } from './app.ts'
import { createPrisma } from './db/prisma.ts'

const port = Number(process.env.PORT ?? 4000)
const db = createPrisma(requireEnv('DATABASE_URL'))

createApp(db).listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
