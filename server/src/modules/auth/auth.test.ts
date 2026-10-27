import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { resetDb, seedTwoTenants, testDb } from '../../../test/db.ts'
import { createApp } from '../../app.ts'

const app = createApp(testDb)
let seeded: Awaited<ReturnType<typeof seedTwoTenants>>

beforeEach(async () => {
  await resetDb()
  seeded = await seedTwoTenants()
})

afterAll(async () => {
  await testDb.$disconnect()
})

describe('POST /api/auth/sign-in', () => {
  it('signs in the mock user abc / abc and returns a mock token', async () => {
    const res = await request(app).post('/api/auth/sign-in').send({ username: 'abc', password: 'abc' })
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      token: `mock-${seeded.userA.id}`,
      user: { id: seeded.userA.id, username: 'abc' },
      tenant: { id: seeded.tenantA.id, name: 'Tenant A' },
    })
  })

  it('trims the username', async () => {
    const res = await request(app).post('/api/auth/sign-in').send({ username: '  abc ', password: 'abc' })
    expect(res.status).toBe(200)
  })

  it('rejects a wrong password with 401', async () => {
    const res = await request(app).post('/api/auth/sign-in').send({ username: 'abc', password: 'nope' })
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('rejects an unknown user with the same 401', async () => {
    const res = await request(app).post('/api/auth/sign-in').send({ username: 'ghost', password: 'abc' })
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('rejects a missing password with 400 naming the field', async () => {
    const res = await request(app).post('/api/auth/sign-in').send({ username: 'abc' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatchObject({ code: 'VALIDATION_ERROR', field: 'password' })
  })

  it('rejects unknown keys with 400 naming the key', async () => {
    const res = await request(app)
      .post('/api/auth/sign-in')
      .send({ username: 'abc', password: 'abc', tenantId: seeded.tenantB.id })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatchObject({ code: 'VALIDATION_ERROR', field: 'tenantId' })
  })
})

describe('GET /api/auth/me', () => {
  it('returns the signed-in user and their tenant', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer mock-${seeded.userA.id}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      user: { id: seeded.userA.id, username: 'abc' },
      tenant: { id: seeded.tenantA.id, name: 'Tenant A' },
    })
  })

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHENTICATED')
  })

  it('returns 401 for a malformed token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer mock-not-a-uuid')
    expect(res.status).toBe(401)
  })

  it('returns 401 for a token of a user that does not exist', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer mock-00000000-0000-4000-8000-000000000000')
    expect(res.status).toBe(401)
  })

  it('tenant B cannot see tenant A: tenant B token only gets tenant B', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer mock-${seeded.userB.id}`)
    expect(res.status).toBe(200)
    expect(res.body.tenant).toEqual({ id: seeded.tenantB.id, name: 'Tenant B' })
    expect(JSON.stringify(res.body)).not.toContain(seeded.tenantA.id)
  })
})
