import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { testDb } from '../test/db.ts'
import { createApp } from './app.ts'

const app = createApp(testDb)

describe('app', () => {
  it('answers the health check', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  it('returns a JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nope')
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('returns 400 INVALID_JSON for a malformed body', async () => {
    const res = await request(app)
      .post('/api/auth/sign-in')
      .set('Content-Type', 'application/json')
      .send('{"username":')
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_JSON')
  })
})
